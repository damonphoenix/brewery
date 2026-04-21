/**
 * Brewery Extension — brews.js
 * Direct port of src/lib/brews.ts — pure ES module, zero dependencies.
 */

/** @typedef {'json-to-parquet'|'json-to-csv'|'csv-to-parquet'|'csv-to-json'|'parquet-to-json'|'parquet-to-csv'|'image-to-jpg'|'image-to-png'|'image-to-webp'|'image-to-gif'|'image-to-tiff'|'image-to-bmp'|'image-to-avif'|'image-to-heic'|'image-to-svg'|'image-to-pdf'|'audio-to-mp3'|'audio-to-wav'|'audio-to-ogg'|'audio-to-flac'|'audio-to-m4a'|'mp4-to-gif'|'video-to-mov'|'video-to-mp4'|'video-to-webm'|'video-to-avi'|'video-to-mkv'|'video-to-wmv'|'video-to-flv'|'video-to-mp3'|'video-to-wav'} BrewId */

/**
 * @typedef {Object} BrewDefinition
 * @property {BrewId} id
 * @property {string} label
 * @property {string} description
 * @property {string} outputMime
 * @property {string} outputExtension
 * @property {boolean} isMedia
 * @property {string[]} [acceptsExtensions]
 */

/** @type {Record<string, BrewDefinition[]>} */
const BREWS = {
  text: [
    { id: 'txt-to-csv',      label: 'CSV',     description: 'One line per row',              outputMime: 'text/csv',                outputExtension: 'csv',     isMedia: false, acceptsExtensions: ['txt', 'log'] },
    { id: 'txt-to-json',     label: 'JSON',    description: 'JSON array of lines',           outputMime: 'application/json',       outputExtension: 'json',    isMedia: false, acceptsExtensions: ['txt', 'log'] },
    { id: 'json-to-parquet', label: 'Parquet', description: 'Columnar format for analytics', outputMime: 'application/x-parquet', outputExtension: 'parquet', isMedia: false, acceptsExtensions: ['json', 'ndjson'] },
    { id: 'json-to-csv',     label: 'CSV',     description: 'Comma-separated values',       outputMime: 'text/csv',                outputExtension: 'csv',     isMedia: false, acceptsExtensions: ['json', 'ndjson'] },
    { id: 'csv-to-parquet',  label: 'Parquet', description: 'Columnar format for analytics', outputMime: 'application/x-parquet', outputExtension: 'parquet', isMedia: false, acceptsExtensions: ['csv'] },
    { id: 'csv-to-json',     label: 'JSON',    description: 'JSON array',                   outputMime: 'application/json',       outputExtension: 'json',    isMedia: false, acceptsExtensions: ['csv'] },
    { id: 'parquet-to-json', label: 'JSON',    description: 'JSON array',                   outputMime: 'application/json',       outputExtension: 'json',    isMedia: false, acceptsExtensions: ['parquet'] },
    { id: 'parquet-to-csv',  label: 'CSV',     description: 'Comma-separated values',       outputMime: 'text/csv',                outputExtension: 'csv',     isMedia: false, acceptsExtensions: ['parquet'] },
  ],
  image: [
    { id: 'image-to-jpg',  label: 'JPG',  description: 'JPEG (lossy)',                    outputMime: 'image/jpeg',    outputExtension: 'jpg',  isMedia: false },
    { id: 'image-to-png',  label: 'PNG',  description: 'PNG (lossless, transparency)',    outputMime: 'image/png',     outputExtension: 'png',  isMedia: false },
    { id: 'image-to-webp', label: 'WebP', description: 'WebP (modern web)',               outputMime: 'image/webp',    outputExtension: 'webp', isMedia: false },
    { id: 'image-to-gif',  label: 'GIF',  description: 'GIF (256 colors, animation)',     outputMime: 'image/gif',     outputExtension: 'gif',  isMedia: false },
    { id: 'image-to-tiff', label: 'TIFF', description: 'TIFF (print quality)',            outputMime: 'image/tiff',    outputExtension: 'tiff', isMedia: false },
    { id: 'image-to-bmp',  label: 'BMP',  description: 'BMP (uncompressed)',              outputMime: 'image/bmp',     outputExtension: 'bmp',  isMedia: false },
    { id: 'image-to-avif', label: 'AVIF', description: 'AVIF (efficient)',                outputMime: 'image/avif',    outputExtension: 'avif', isMedia: false },
    { id: 'image-to-svg',  label: 'SVG',  description: 'SVG (vector wrapper)',            outputMime: 'image/svg+xml', outputExtension: 'svg',  isMedia: false },
    { id: 'image-to-pdf',  label: 'PDF',  description: 'PDF (single page)',               outputMime: 'application/pdf', outputExtension: 'pdf', isMedia: false },
  ],
  audio: [
    { id: 'audio-to-mp3',  label: 'MP3',  description: 'Compressed audio (max 100MB)',       outputMime: 'audio/mpeg', outputExtension: 'mp3',  isMedia: true },
    { id: 'audio-to-wav',  label: 'WAV',  description: 'Lossless PCM (max 100MB)',            outputMime: 'audio/wav',  outputExtension: 'wav',  isMedia: true },
    { id: 'audio-to-ogg',  label: 'OGG',  description: 'Open Vorbis (max 100MB)',             outputMime: 'audio/ogg',  outputExtension: 'ogg',  isMedia: true },
    { id: 'audio-to-flac', label: 'FLAC', description: 'Lossless FLAC (max 100MB)',           outputMime: 'audio/flac', outputExtension: 'flac', isMedia: true },
    { id: 'audio-to-m4a',  label: 'M4A',  description: 'AAC in M4A container (max 100MB)',   outputMime: 'audio/mp4',  outputExtension: 'm4a',  isMedia: true },
  ],
  video: [
    { id: 'mp4-to-gif',     label: 'GIF',         description: 'Animated GIF (max 100MB)',      outputMime: 'image/gif',           outputExtension: 'gif',  isMedia: true },
    { id: 'video-to-mp4',   label: 'MP4',         description: 'MPEG-4 (max 100MB)',            outputMime: 'video/mp4',           outputExtension: 'mp4',  isMedia: true },
    { id: 'video-to-webm',  label: 'WebM',        description: 'WebM (max 100MB)',              outputMime: 'video/webm',          outputExtension: 'webm', isMedia: true },
    { id: 'video-to-mov',   label: 'MOV',         description: 'QuickTime (max 100MB)',         outputMime: 'video/quicktime',     outputExtension: 'mov',  isMedia: true },
    { id: 'video-to-avi',   label: 'AVI',         description: 'AVI (max 100MB)',               outputMime: 'video/x-msvideo',    outputExtension: 'avi',  isMedia: true },
    { id: 'video-to-mkv',   label: 'MKV',         description: 'Matroska (max 100MB)',          outputMime: 'video/x-matroska',   outputExtension: 'mkv',  isMedia: true },
    { id: 'video-to-wmv',   label: 'WMV',         description: 'Windows Media (max 100MB)',     outputMime: 'video/x-ms-wmv',     outputExtension: 'wmv',  isMedia: true },
    { id: 'video-to-flv',   label: 'FLV',         description: 'Flash Video (max 100MB)',       outputMime: 'video/x-flv',        outputExtension: 'flv',  isMedia: true },
    { id: 'video-to-mp3',   label: 'Extract MP3', description: 'Audio only (max 100MB)',        outputMime: 'audio/mpeg',          outputExtension: 'mp3',  isMedia: true },
    { id: 'video-to-wav',   label: 'Extract WAV', description: 'Audio only (max 100MB)',        outputMime: 'audio/wav',           outputExtension: 'wav',  isMedia: true },
  ],
};

const MAX_MEDIA_BYTES = 100 * 1024 * 1024;
export const MAX_MEDIA_SIZE_MB = 100;

function normalizeMime(mime) {
  const n = (mime || '').toLowerCase().trim();
  if (n === 'image/jpg') return 'image/jpeg';
  if (n === 'audio/mp3') return 'audio/mpeg';
  return n;
}

const EQUIVALENT_EXT = { tiff: ['tif'], tif: ['tiff'], jpg: ['jpeg'], jpeg: ['jpg'] };

function outputMatchesFile(file, brew) {
  const mime = normalizeMime(file.type || '');
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const outExt = brew.outputExtension.toLowerCase();
  if (outExt === ext) return true;
  const equiv = EQUIVALENT_EXT[outExt];
  if (equiv?.includes(ext)) return true;
  return normalizeMime(brew.outputMime) === mime;
}

/** @param {string} category @returns {BrewDefinition[]} */
export function getBrewsForCategory(category) {
  return BREWS[category] ?? [];
}

/** @param {File} file @param {string} category @returns {BrewDefinition[]} */
export function getBrewsForFile(file, category) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return getBrewsForCategory(category).filter((brew) => {
    if (brew.acceptsExtensions && !brew.acceptsExtensions.includes(ext)) return false;
    return !outputMatchesFile(file, brew);
  });
}

/** @param {BrewId} id @returns {BrewDefinition|undefined} */
export function getBrewById(id) {
  return Object.values(BREWS).flat().find((b) => b.id === id);
}

/** @param {number} fileSize @param {BrewDefinition} brew @returns {boolean} */
export function isOverMediaLimit(fileSize, brew) {
  return brew.isMedia && fileSize > MAX_MEDIA_BYTES;
}
