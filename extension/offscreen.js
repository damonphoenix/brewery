/**
 * Brewery Extension — offscreen.js
 * FFmpeg WASM bridge running in an offscreen document.
 * Uses @ffmpeg/ffmpeg v0.12 with all assets loaded locally from extension/wasm/.
 */

import { FFmpeg } from './wasm/ffmpeg.mjs';
import { toBlobURL } from './wasm/ffmpeg-util.mjs';
import { getBrewById } from './lib/brews.js';

let _ffmpeg = null;

async function getFFmpeg(onProgress) {
  if (_ffmpeg) {
    _ffmpeg.off('progress');
    if (onProgress) _ffmpeg.on('progress', ({ progress }) => onProgress(Math.round(progress * 100)));
    return _ffmpeg;
  }

  const ffmpeg = new FFmpeg();
  if (onProgress) ffmpeg.on('progress', ({ progress }) => onProgress(Math.round(progress * 100)));

  const base = chrome.runtime.getURL('wasm/');

  // toBlobURL wraps a local URL into a blob: URL so FFmpeg's Worker can fetch it
  // even from within the extension origin
  await ffmpeg.load({
    coreURL:   await toBlobURL(base + 'ffmpeg-core.js',   'text/javascript'),
    wasmURL:   await toBlobURL(base + 'ffmpeg-core.wasm', 'application/wasm'),
    workerURL: await toBlobURL(base + 'ffmpeg-worker.js', 'text/javascript'),
  });

  _ffmpeg = ffmpeg;
  return ffmpeg;
}

async function convertWithFFmpeg(brewId, fileName, buffer, onProgress) {
  const brew = getBrewById(brewId);
  if (!brew) throw new Error(`Unknown brew: ${brewId}`);

  const ffmpeg = await getFFmpeg(onProgress);
  const inputExt  = fileName.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `input.${inputExt}`;
  const outputName = `output.${brew.outputExtension}`;

  await ffmpeg.writeFile(inputName, new Uint8Array(buffer));

  const args = ['-i', inputName];
  let code;

  // ── Audio ──────────────────────────────────────────────────────────────────
  if (brewId.startsWith('audio-to-')) {
    const ext = brew.outputExtension;
    if (ext === 'mp3')  args.push('-acodec', 'libmp3lame', '-q:a', '2');
    else if (ext === 'wav')  args.push('-acodec', 'pcm_s16le');
    else if (ext === 'ogg')  args.push('-acodec', 'libvorbis', '-q:a', '4');
    else if (ext === 'flac') args.push('-acodec', 'flac');
    else if (ext === 'm4a')  args.push('-acodec', 'aac', '-b:a', '192k');
    args.push(outputName);
    code = await ffmpeg.exec(args);
  }
  // ── Video → GIF ───────────────────────────────────────────────────────────
  else if (brewId === 'mp4-to-gif') {
    args.push('-vf', 'fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', '-loop', '0', outputName);
    code = await ffmpeg.exec(args);
  }
  // ── Video → audio extract ─────────────────────────────────────────────────
  else if (brewId === 'video-to-mp3') {
    args.push('-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName);
    code = await ffmpeg.exec(args);
  }
  else if (brewId === 'video-to-wav') {
    args.push('-vn', '-acodec', 'pcm_s16le', outputName);
    code = await ffmpeg.exec(args);
  }
  // ── Generic video → video (try stream copy first, re-encode on fail) ───────
  else {
    code = await ffmpeg.exec(['-i', inputName, '-c', 'copy', outputName]);
    if (code !== 0) {
      await ffmpeg.deleteFile(outputName).catch(() => {});
      code = await ffmpeg.exec(['-i', inputName, outputName]);
    }
  }

  if (code !== 0) throw new Error('FFmpeg conversion failed — the file may be unsupported or corrupted.');

  const data = await ffmpeg.readFile(outputName);
  const outBuffer = data instanceof Uint8Array ? data.buffer : data;

  await ffmpeg.deleteFile(inputName).catch(() => {});
  await ffmpeg.deleteFile(outputName).catch(() => {});

  const base2 = fileName.replace(/\.[^.]+$/, '') || 'converted';
  return { buffer: outBuffer, filename: `${base2}.${brew.outputExtension}`, mimeType: brew.outputMime };
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'brewery_convert') return false;

  const { msgId, brewId, fileName, buffer } = message;

  convertWithFFmpeg(brewId, fileName, buffer, (progress) => {
    chrome.runtime.sendMessage({ type: 'brewery_progress', msgId, progress }).catch(() => {});
  })
    .then(result => sendResponse(result))
    .catch(err  => sendResponse({ error: err.message || 'Unknown error' }));

  return true; // Keep channel open for async response
});
