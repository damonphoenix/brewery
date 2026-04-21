/**
 * Brewery Extension — conversion/media.js
 * Delegates audio/video conversions to the offscreen document (FFmpeg WASM).
 * Uses the chrome.offscreen API (MV3) to run FFmpeg in a context that
 * allows SharedArrayBuffer without COOP/COEP headers.
 */

const MEDIA_BREW_IDS = new Set([
  'audio-to-mp3', 'audio-to-wav', 'audio-to-ogg', 'audio-to-flac', 'audio-to-m4a',
  'mp4-to-gif',
  'video-to-mov', 'video-to-mp4', 'video-to-webm', 'video-to-avi',
  'video-to-mkv', 'video-to-wmv', 'video-to-flv', 'video-to-mp3', 'video-to-wav',
]);

export function isMediaBrew(brewId) { return MEDIA_BREW_IDS.has(brewId); }

let _offscreenReady = false;

async function ensureOffscreen() {
  if (_offscreenReady) return;
  const existing = await chrome.offscreen.hasDocument?.().catch(() => false) ?? false;
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL('offscreen.html'),
      reasons: ['BLOBS'],
      justification: 'FFmpeg WASM requires SharedArrayBuffer, available in offscreen documents',
    });
  }
  _offscreenReady = true;
}

async function closeOffscreen() {
  try {
    await chrome.offscreen.closeDocument();
    _offscreenReady = false;
  } catch { /* already closed */ }
}

/**
 * Convert a single media file via the offscreen FFmpeg document.
 * @param {string} brewId
 * @param {File} file
 * @param {{ onProgress?: (p: number|null) => void }} [callbacks]
 * @returns {Promise<{ blob: Blob, filename: string, mimeType: string }>}
 */
export async function runMediaConversion(brewId, file, callbacks) {
  if (!MEDIA_BREW_IDS.has(brewId)) throw new Error(`Unsupported media brew: ${brewId}`);

  callbacks?.onProgress?.(null);
  await ensureOffscreen();

  const buffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const msgId = `${brewId}_${Date.now()}_${Math.random()}`;

    // Progress relay listener
    const progressListener = (message) => {
      if (message.type !== 'brewery_progress' || message.msgId !== msgId) return;
      callbacks?.onProgress?.(message.progress);
    };
    chrome.runtime.onMessage.addListener(progressListener);

    // Send conversion request to offscreen document
    chrome.runtime.sendMessage({
      type: 'brewery_convert',
      msgId,
      brewId,
      fileName: file.name,
      buffer,
    }, (response) => {
      chrome.runtime.onMessage.removeListener(progressListener);

      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response?.error) {
        reject(new Error(response.error));
        return;
      }
      if (!response?.buffer) {
        reject(new Error('Offscreen document returned no data.'));
        return;
      }

      const blob = new Blob([response.buffer], { type: response.mimeType });
      resolve({ blob, filename: response.filename, mimeType: response.mimeType });

      // Close offscreen doc after a short delay (in case of rapid batch calls)
      setTimeout(closeOffscreen, 2000);
    });
  });
}

/**
 * Convert multiple media files in parallel (batch mode).
 * @param {string} brewId
 * @param {File[]} files
 * @param {{ onProgress?: (fileIndex: number, p: number|null) => void }} [callbacks]
 * @returns {Promise<Array<{ blob: Blob, filename: string, mimeType: string } | null>>}
 */
export async function runMediaConversionBatch(brewId, files, callbacks) {
  const results = await Promise.allSettled(
    files.map((file, i) =>
      runMediaConversion(brewId, file, {
        onProgress: (p) => callbacks?.onProgress?.(i, p),
      })
    )
  );
  return results.map(r => (r.status === 'fulfilled' ? r.value : null));
}
