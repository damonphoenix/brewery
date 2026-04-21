/**
 * Brewery Extension — fileTypes.js
 * Direct port of src/lib/fileTypes.ts — pure ES module, zero dependencies.
 */

/** @typedef {'text'|'image'|'audio'|'video'} FileCategory */

const MIME_TO_CATEGORY = {
  'text/plain': 'text', 'text/csv': 'text', 'application/json': 'text',
  'application/x-ndjson': 'text', 'text/x-log': 'text', 'application/x-parquet': 'text',
  'image/jpeg': 'image', 'image/jpg': 'image', 'image/png': 'image', 'image/webp': 'image',
  'image/heic': 'image', 'image/heif': 'image', 'image/gif': 'image', 'image/tiff': 'image',
  'image/bmp': 'image', 'image/x-ms-bmp': 'image', 'image/avif': 'image',
  'image/svg+xml': 'image', 'image/x-tiff': 'image', 'application/pdf': 'image',
  'application/postscript': 'image', 'application/illustrator': 'image',
  'audio/wav': 'audio', 'audio/wave': 'audio', 'audio/x-wav': 'audio',
  'audio/mpeg': 'audio', 'audio/mp3': 'audio', 'audio/ogg': 'audio',
  'audio/webm': 'audio', 'audio/flac': 'audio',
  'video/mp4': 'video', 'video/webm': 'video', 'video/ogg': 'video',
  'video/x-msvideo': 'video', 'video/quicktime': 'video', 'video/x-matroska': 'video',
  'video/x-ms-wmv': 'video', 'video/x-flv': 'video',
};

const EXT_TO_CATEGORY = {
  txt: 'text', csv: 'text', json: 'text', ndjson: 'text', log: 'text', parquet: 'text',
  jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', heic: 'image', heif: 'image',
  gif: 'image', tiff: 'image', tif: 'image', bmp: 'image', avif: 'image', svg: 'image',
  pdf: 'image', eps: 'image', ai: 'image', nef: 'image', cr2: 'image', orf: 'image',
  wav: 'audio', mp3: 'audio', ogg: 'audio', flac: 'audio', m4a: 'audio',
  mp4: 'video', webm: 'video', mov: 'video', avi: 'video', mkv: 'video', wmv: 'video', flv: 'video',
};

/** @type {Record<FileCategory, string>} */
export const CATEGORY_LABELS = { text: 'Text / Data', image: 'Image', audio: 'Audio', video: 'Video' };

/** @type {Record<FileCategory, string>} */
export const CATEGORY_ICONS_SVG = {
  text: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
};

/**
 * @param {File} file
 * @returns {FileCategory|null}
 */
export function getFileCategory(file) {
  const mime = file.type?.toLowerCase();
  if (mime && MIME_TO_CATEGORY[mime]) return MIME_TO_CATEGORY[mime];
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && EXT_TO_CATEGORY[ext]) return EXT_TO_CATEGORY[ext];
  return null;
}

/** @param {File} file @returns {boolean} */
export function isAcceptedFile(file) {
  return getFileCategory(file) !== null;
}
