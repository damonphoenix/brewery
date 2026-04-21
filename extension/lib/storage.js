/**
 * Brewery Extension — storage.js
 * State persistence via chrome.storage.local (replaces IndexedDB from web app).
 */

const FILE_STORE_KEY = 'brewery_last_session';

/**
 * Save a list of file metadata (not the file blobs — too large for storage.local).
 * We just remember filenames + categories for UI restoration hints.
 * @param {{ name: string, size: number, type: string }[]} fileMetas
 */
export async function saveSessionMeta(fileMetas) {
  try {
    await chrome.storage.local.set({ [FILE_STORE_KEY]: fileMetas });
  } catch {
    // Non-fatal — storage might be too full
  }
}

/**
 * Load persisted session meta (filenames/sizes only — not actual File objects).
 * @returns {Promise<{ name: string, size: number, type: string }[]>}
 */
export async function loadSessionMeta() {
  try {
    const result = await chrome.storage.local.get(FILE_STORE_KEY);
    return result[FILE_STORE_KEY] || [];
  } catch {
    return [];
  }
}

/** Clear session state */
export async function clearSession() {
  try {
    await chrome.storage.local.remove(FILE_STORE_KEY);
  } catch {
    // Non-fatal
  }
}
