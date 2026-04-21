/**
 * Brewery Extension — sidepanel.js
 * Batch-capable, multi-category state machine.
 *
 * Design: when mixed file types are dropped, files are grouped by category.
 * Each group gets its own format selector and brew button. Groups convert
 * independently in parallel. Follows MV3 UX guidelines:
 *   - No auto-open, no intrusive dialogs
 *   - All links open in new tabs
 *   - Accessible ARIA labels and live regions
 *   - Responsive flex layout
 *   - State persisted to chrome.storage on reset
 */

import { getFileCategory, CATEGORY_LABELS, CATEGORY_ICONS_SVG } from './lib/fileTypes.js';
import { getBrewsForFile } from './lib/brews.js';
import { runImageConversion, isImageBrew } from './lib/conversion/image.js';
import { runDataConversion, isDataBrew } from './lib/conversion/data.js';
import { runMediaConversion, isMediaBrew } from './lib/conversion/media.js';

// ── State ─────────────────────────────────────────────────────────────────────
// files: Array<FileItem>
// FileItem: { file, category, status: queued|converting|done|error, result, error, progress }
//
// groups: derived — Map<category, FileItem[]>
// Each category group tracks its own selectedBrewId independently.

const state = {
  files: [],
  // selectedBrewId per category
  selectedBrewIds: {}, // { [category]: brewId | null }
  phase: 'IDLE', // IDLE | FILES_SELECTED | CONVERTING | DONE
};

// ── Utilities ─────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function show(el) { el?.classList.remove('hidden'); }
function hide(el) { el?.classList.add('hidden'); }

/** Groups file items by category, preserving insertion order. */
function getGroups() {
  const map = new Map();
  for (const item of state.files) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category).push(item);
  }
  return map; // Map<category, FileItem[]>
}

function allDone() {
  return state.files.length > 0 && state.files.every(f => f.status === 'done' || f.status === 'error');
}

// ── DOM refs ──────────────────────────────────────────────────────────────────

const els = {
  app:            $('app'),
  stateIdle:      $('state-idle'),
  stateFiles:     $('state-files'),
  stateDone:      $('state-done'),
  dropZone:       $('drop-zone'),
  dropZoneCompact:$('drop-zone-compact'),
  fileInput:      $('file-input'),
  fileInputCpt:   $('file-input-compact'),
  dropError:      $('drop-error'),
  dropErrorCpt:   $('drop-error-compact'),
  groupsContainer:$('groups-container'),
  btnClearAll:    $('btn-clear-all'),
  filesCountLabel:$('files-count-label'),
  doneHeading:    $('done-heading'),
  doneSub:        $('done-sub'),
  doneFileList:   $('done-file-list'),
  btnReset:       $('btn-reset'),
  dropTitle:      $('drop-title'),
  statusRegion:   $('status-region'),
};

// ── Status icon SVG strings ───────────────────────────────────────────────────

const STATUS_ICONS = {
  queued:     `<svg class="status-queued"     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" opacity="0.35"/></svg>`,
  converting: `<svg class="status-converting spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  done:       `<svg class="status-done"       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:      `<svg class="status-error"      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

// ── File card rendering ───────────────────────────────────────────────────────

function makeFileCard(item, index, canRemove) {
  const card = document.createElement('div');
  card.className = `file-card card-${item.status}`;
  card.id = `file-card-${index}`;
  card.setAttribute('role', 'listitem');

  const progressWidth = item.status === 'converting'
    ? (item.progress != null ? `${item.progress}%` : '3%')
    : item.status === 'done' ? '100%' : '0%';

  const progressBg = item.status === 'done' ? 'var(--success)' : 'var(--accent-amber)';

  card.innerHTML = `
    <div class="file-card-icon" aria-hidden="true">${CATEGORY_ICONS_SVG[item.category]}</div>
    <div class="file-card-info">
      <div class="file-card-name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</div>
      <div class="file-card-meta" id="file-card-meta-${index}">
        ${escapeHtml(formatBytes(item.file.size))}&nbsp;&middot;&nbsp;${escapeHtml(CATEGORY_LABELS[item.category])}
        ${item.status === 'done' && item.result
          ? ` &rarr; <strong style="color:var(--text-primary)">${escapeHtml(item.result.filename)}</strong>`
          : ''}
        ${item.status === 'error' && item.error
          ? ` &mdash; <span style="color:var(--error)">${escapeHtml(item.error)}</span>`
          : ''}
      </div>
    </div>
    <div class="file-card-status" id="file-card-status-${index}">${STATUS_ICONS[item.status]}</div>
    ${canRemove ? `<button class="btn-remove-file" type="button" aria-label="Remove ${escapeHtml(item.file.name)}" data-index="${index}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>` : ''}
    <div class="card-progress-rail" id="file-card-rail-${index}" style="width:${progressWidth};background:${progressBg}"></div>
  `;

  if (canRemove) {
    card.querySelector('.btn-remove-file')?.addEventListener('click', e => {
      e.stopPropagation();
      removeFileAt(index);
    });
  }
  return card;
}

/** Surgically update a card's status/progress without full re-render */
function patchFileCard(index) {
  const item = state.files[index];
  const card = $(`file-card-${index}`);
  if (!card || !item) return;

  card.className = `file-card card-${item.status}`;

  const statusEl = $(`file-card-status-${index}`);
  if (statusEl) statusEl.innerHTML = STATUS_ICONS[item.status];

  const rail = $(`file-card-rail-${index}`);
  if (rail) {
    if (item.status === 'converting') {
      rail.style.width = item.progress != null ? `${item.progress}%` : '3%';
      rail.style.background = 'var(--accent-amber)';
    } else if (item.status === 'done') {
      rail.style.width = '100%';
      rail.style.background = 'var(--success)';
    } else {
      rail.style.width = '0%';
    }
  }

  const meta = $(`file-card-meta-${index}`);
  if (meta) {
    let t = `${formatBytes(item.file.size)}&nbsp;&middot;&nbsp;${CATEGORY_LABELS[item.category]}`;
    if (item.status === 'done' && item.result)
      t += ` &rarr; <strong style="color:var(--text-primary)">${escapeHtml(item.result.filename)}</strong>`;
    if (item.status === 'error' && item.error)
      t += ` &mdash; <span style="color:var(--error)">${escapeHtml(item.error)}</span>`;
    meta.innerHTML = t;
  }
}

// ── Group section rendering ───────────────────────────────────────────────────

function renderGroups(listEl, canRemove, showControls) {
  listEl.innerHTML = '';
  const groups = getGroups();

  for (const [category, items] of groups) {
    const groupEl = document.createElement('div');
    groupEl.className = 'category-group';
    groupEl.dataset.category = category;

    // Category header (only shown when there are multiple categories)
    if (groups.size > 1) {
      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `
        <span class="category-header-icon" aria-hidden="true">${CATEGORY_ICONS_SVG[category]}</span>
        <span class="category-header-label">${escapeHtml(CATEGORY_LABELS[category])}</span>
        <span class="category-header-count">${items.length}</span>
      `;
      groupEl.appendChild(header);
    }

    // File cards
    const cardList = document.createElement('div');
    cardList.className = 'file-list';
    cardList.setAttribute('role', 'list');
    for (const item of items) {
      const index = state.files.indexOf(item);
      cardList.appendChild(makeFileCard(item, index, canRemove));
    }
    groupEl.appendChild(cardList);

    // Format selector + brew button (only in active state, not done)
    if (showControls && state.phase !== 'CONVERTING') {
      const brewId = state.selectedBrewIds[category] ?? null;
      const brews = getBrewsForFile(items[0].file, category);

      if (brews.length) {
        const controls = document.createElement('div');
        controls.className = 'group-controls';
        controls.dataset.category = category;

        // Format pills
        const pillLabel = document.createElement('p');
        pillLabel.className = 'format-label';
        pillLabel.textContent = groups.size > 1
          ? `Convert ${CATEGORY_LABELS[category]} to`
          : 'Convert to';
        controls.appendChild(pillLabel);

        const pillWrap = document.createElement('div');
        pillWrap.className = 'format-pills';
        pillWrap.setAttribute('role', 'group');
        pillWrap.setAttribute('aria-label', `Output format for ${CATEGORY_LABELS[category]}`);

        for (const brew of brews) {
          const pill = document.createElement('button');
          pill.className = `format-pill${brewId === brew.id ? ' selected' : ''}`;
          pill.type = 'button';
          pill.dataset.brewId = brew.id;
          pill.dataset.category = category;
          pill.textContent = brew.label;
          pill.title = brew.description;
          pill.setAttribute('aria-pressed', String(brewId === brew.id));
          pill.addEventListener('click', () => {
            state.selectedBrewIds[category] = brew.id;
            // Re-render only the controls for this group
            renderGroupControls(category);
          });
          pillWrap.appendChild(pill);
        }
        controls.appendChild(pillWrap);

        // Per-group brew button
        const brewBtn = document.createElement('button');
        brewBtn.className = 'brew-btn brew-btn-group';
        brewBtn.type = 'button';
        brewBtn.dataset.category = category;
        brewBtn.disabled = !brewId;
        brewBtn.innerHTML = brewId
          ? `Brew ${items.length} ${items.length === 1 ? 'ingredient' : 'ingredients'} &rarr;`
          : `Select a format above`;
        brewBtn.setAttribute('aria-label', `Convert ${CATEGORY_LABELS[category]} files`);
        brewBtn.addEventListener('click', () => startBrewingGroup(category));
        controls.appendChild(brewBtn);

        groupEl.appendChild(controls);
      }
    }

    listEl.appendChild(groupEl);
  }
}

/** Re-render only the controls section for one category group */
function renderGroupControls(category) {
  const groupEl = els.groupsContainer?.querySelector(`.category-group[data-category="${category}"]`);
  if (!groupEl) { render(); return; }

  const existing = groupEl.querySelector('.group-controls');
  if (existing) existing.remove();

  const brewId = state.selectedBrewIds[category] ?? null;
  const items = state.files.filter(f => f.category === category);
  if (!items.length) return;

  const brews = getBrewsForFile(items[0].file, category);
  if (!brews.length) return;

  const groups = getGroups();
  const controls = document.createElement('div');
  controls.className = 'group-controls';
  controls.dataset.category = category;

  const pillLabel = document.createElement('p');
  pillLabel.className = 'format-label';
  pillLabel.textContent = groups.size > 1
    ? `Convert ${CATEGORY_LABELS[category]} to`
    : 'Convert to';
  controls.appendChild(pillLabel);

  const pillWrap = document.createElement('div');
  pillWrap.className = 'format-pills';
  pillWrap.setAttribute('role', 'group');
  pillWrap.setAttribute('aria-label', `Output format for ${CATEGORY_LABELS[category]}`);

  for (const brew of brews) {
    const pill = document.createElement('button');
    pill.className = `format-pill${brewId === brew.id ? ' selected' : ''}`;
    pill.type = 'button';
    pill.dataset.brewId = brew.id;
    pill.dataset.category = category;
    pill.textContent = brew.label;
    pill.title = brew.description;
    pill.setAttribute('aria-pressed', String(brewId === brew.id));
    pill.addEventListener('click', () => {
      state.selectedBrewIds[category] = brew.id;
      renderGroupControls(category);
    });
    pillWrap.appendChild(pill);
  }
  controls.appendChild(pillWrap);

  const brewBtn = document.createElement('button');
  brewBtn.className = 'brew-btn brew-btn-group';
  brewBtn.type = 'button';
  brewBtn.dataset.category = category;
  brewBtn.disabled = !brewId;
  brewBtn.innerHTML = brewId
    ? `Brew ${items.length} ${items.length === 1 ? 'ingredient' : 'ingredients'} &rarr;`
    : `Select a format above`;
  brewBtn.setAttribute('aria-label', `Convert ${CATEGORY_LABELS[category]} files`);
  brewBtn.addEventListener('click', () => startBrewingGroup(category));
  controls.appendChild(brewBtn);

  groupEl.appendChild(controls);
}

// ── Main render ───────────────────────────────────────────────────────────────

function render() {
  const { phase, files } = state;

  if (phase === 'IDLE') {
    show(els.stateIdle);
    hide(els.stateFiles);
    hide(els.stateDone);
    els.dropZone?.classList.remove('drag-active', 'has-files');
    return;
  }

  if (phase === 'DONE') {
    hide(els.stateIdle);
    hide(els.stateFiles);
    show(els.stateDone);

    const doneCount  = files.filter(f => f.status === 'done').length;
    const errorCount = files.filter(f => f.status === 'error').length;

    if (els.doneSub) {
      els.doneSub.textContent = errorCount
        ? `${doneCount} brewed · ${errorCount} couldn't be converted.`
        : `${doneCount} file${doneCount !== 1 ? 's' : ''} ready to drink.`;
    }

    if (els.doneFileList) {
      els.doneFileList.innerHTML = '';
      renderGroups(els.doneFileList, false, false);
    }
    return;
  }

  // FILES_SELECTED / CONVERTING
  hide(els.stateIdle);
  show(els.stateFiles);
  hide(els.stateDone);

  const count = files.length;
  if (els.filesCountLabel) {
    els.filesCountLabel.textContent = `${count} ingredient${count !== 1 ? 's' : ''}`;
  }

  // Show/hide compact drop zone (hidden while converting)
  if (els.dropZoneCompact) {
    els.dropZoneCompact.style.display = phase === 'CONVERTING' ? 'none' : '';
  }

  // Render category groups
  if (els.groupsContainer) {
    renderGroups(els.groupsContainer, phase !== 'CONVERTING', true);
  }
}

// ── File management ───────────────────────────────────────────────────────────

function processIncoming(fileList) {
  const result = [];
  let hadUnsupported = false;
  for (const file of Array.from(fileList)) {
    const category = getFileCategory(file);
    if (!category) { hadUnsupported = true; continue; }
    result.push({ file, category });
  }
  return { result, hadUnsupported };
}

function addFiles(fileList) {
  clearInlineError(els.dropError);
  clearInlineError(els.dropErrorCpt);

  const { result, hadUnsupported } = processIncoming(fileList);

  if (!result.length) {
    showInlineError(
      state.phase === 'IDLE' ? els.dropError : els.dropErrorCpt,
      "We don't recognise these ingredients. Try image, audio, video, or data files."
    );
    return;
  }

  // Add (dedup by name+size across the whole list)
  let added = 0;
  for (const { file, category } of result) {
    const dup = state.files.some(f => f.file.name === file.name && f.file.size === file.size);
    if (!dup) {
      state.files.push({ file, category, status: 'queued', result: null, error: null, progress: null });
      // Initialise format selection for new category if needed
      if (!(category in state.selectedBrewIds)) {
        state.selectedBrewIds[category] = null;
      }
      added++;
    }
  }

  // Warn if some files were skipped
  if (hadUnsupported && added > 0) {
    showInlineError(
      state.phase === 'IDLE' ? els.dropError : els.dropErrorCpt,
      "Some files weren't recognised and were skipped — only supported types were added."
    );
  }

  if (added > 0) {
    state.phase = 'FILES_SELECTED';
    render();
  }
}

function removeFileAt(index) {
  const removed = state.files[index];
  state.files.splice(index, 1);

  // Clean up selectedBrewId if that category is now empty
  if (removed) {
    const stillHasCategory = state.files.some(f => f.category === removed.category);
    if (!stillHasCategory) delete state.selectedBrewIds[removed.category];
  }

  if (!state.files.length) {
    resetToIdle();
    return;
  }
  render();
}

function resetToIdle() {
  state.files = [];
  state.selectedBrewIds = {};
  state.phase = 'IDLE';
  clearInlineError(els.dropError);
  clearInlineError(els.dropErrorCpt);
  render();
}

// ── Inline error helpers ──────────────────────────────────────────────────────

function showInlineError(el, msg) {
  if (!el) return;
  el.innerHTML = `
    <div class="inline-msg error" role="alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>${escapeHtml(msg)}</span>
    </div>`;
  show(el);
}

function clearInlineError(el) {
  if (!el) return;
  hide(el);
  el.innerHTML = '';
}

// ── Conversion ────────────────────────────────────────────────────────────────

async function startBrewingGroup(category) {
  const brewId = state.selectedBrewIds[category];
  if (!brewId) return;

  const items = state.files.filter(f => f.category === category && f.status === 'queued');
  if (!items.length) return;

  state.phase = 'CONVERTING';
  render();

  const conversions = items.map(item => {
    const index = state.files.indexOf(item);
    item.status = 'converting';
    item.progress = null;
    patchFileCard(index);

    const callbacks = {
      onProgress: p => {
        item.progress = p;
        patchFileCard(index);
      },
    };

    let promise;
    if (isImageBrew(brewId))     promise = runImageConversion(brewId, item.file, callbacks);
    else if (isDataBrew(brewId)) promise = runDataConversion(brewId, item.file, callbacks);
    else if (isMediaBrew(brewId))promise = runMediaConversion(brewId, item.file, callbacks);
    else promise = Promise.reject(new Error(`Unsupported brew: ${brewId}`));

    return promise.then(result => {
      item.status = 'done';
      item.result = result;
      item.progress = 100;
      patchFileCard(index);
      triggerDownload(result);
    }).catch(err => {
      item.status = 'error';
      item.error = err.message || 'Conversion failed.';
      patchFileCard(index);
    });
  });

  await Promise.allSettled(conversions);

  // Check if ALL categories are done
  if (allDone()) {
    state.phase = 'DONE';
    render();

    // Announce to screen readers
    if (els.statusRegion) {
      const doneCount = state.files.filter(f => f.status === 'done').length;
      els.statusRegion.textContent = `All done! ${doneCount} file${doneCount !== 1 ? 's' : ''} brewed and downloaded.`;
    }
  } else {
    // Some categories still queued — stay in FILES_SELECTED
    state.phase = 'FILES_SELECTED';
    render();
  }
}

function triggerDownload(result) {
  try {
    // Prefer chrome.downloads for reliable cross-context downloads in extensions
    if (typeof chrome !== 'undefined' && chrome.downloads?.download) {
      const url = URL.createObjectURL(result.blob);
      chrome.downloads.download({ url, filename: result.filename, saveAs: false }, () => {
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      });
    } else {
      // Fallback: anchor click
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      // MV3 guideline: links that navigate must have target=_blank
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  } catch {
    // Silently fail — file still converted, user can try again
  }
}

// ── Drag & Drop ───────────────────────────────────────────────────────────────

function setupDropZone(zone, inputEl) {
  if (!zone || !inputEl) return;

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
    if (state.phase === 'CONVERTING') return;
    zone.classList.add('drag-active');
    if (els.dropTitle) els.dropTitle.textContent = 'Release to add ingredients';
  });

  zone.addEventListener('dragleave', e => {
    if (zone.contains(e.relatedTarget)) return;
    zone.classList.remove('drag-active');
    if (els.dropTitle) els.dropTitle.textContent = 'Drop your ingredients here';
  });

  zone.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove('drag-active');
    if (els.dropTitle) els.dropTitle.textContent = 'Drop your ingredients here';
    if (state.phase === 'CONVERTING') return;
    const files = e.dataTransfer?.files;
    if (files?.length) addFiles(files);
  });

  // Click to browse — MV3: user gesture required for file input
  zone.addEventListener('click', e => {
    if (state.phase === 'CONVERTING') return;
    if (!zone.contains(e.target) && e.target !== zone) return;
    inputEl.click();
  });

  zone.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && state.phase !== 'CONVERTING') {
      e.preventDefault();
      inputEl.click();
    }
  });

  inputEl.addEventListener('change', e => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  });
}

setupDropZone(els.dropZone,        els.fileInput);
setupDropZone(els.dropZoneCompact, els.fileInputCpt);

// Body-level drop catch-all (so users can drop anywhere in panel)
document.body.addEventListener('dragover', e => {
  if (state.phase === 'CONVERTING') return;
  e.preventDefault();
  if (state.phase === 'IDLE') {
    els.dropZone?.classList.add('drag-active');
    if (els.dropTitle) els.dropTitle.textContent = 'Release to add ingredients';
  }
});
document.body.addEventListener('dragleave', e => {
  if (!document.body.contains(e.relatedTarget)) {
    els.dropZone?.classList.remove('drag-active');
    if (els.dropTitle) els.dropTitle.textContent = 'Drop your ingredients here';
  }
});
document.body.addEventListener('drop', e => {
  e.preventDefault();
  els.dropZone?.classList.remove('drag-active');
  if (els.dropTitle) els.dropTitle.textContent = 'Drop your ingredients here';
  if (state.phase === 'CONVERTING') return;
  const files = e.dataTransfer?.files;
  if (files?.length) addFiles(files);
});

// ── Buttons ───────────────────────────────────────────────────────────────────

els.btnClearAll?.addEventListener('click', resetToIdle);
els.btnReset?.addEventListener('click', resetToIdle);

// ── Boot ──────────────────────────────────────────────────────────────────────

render();
els.app?.classList.add('ready');
