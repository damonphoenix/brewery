/**
 * Maps MIME types and file extensions to internal file categories.
 * Used for instant "sniffing" when a file is dropped on the bar counter.
 */

export type FileCategory = "text" | "image" | "audio" | "video";

const MIME_TO_CATEGORY: Record<string, FileCategory> = {
  // Text / data
  "text/plain": "text",
  "text/csv": "text",
  "application/json": "text",
  "application/x-ndjson": "text",
  "text/x-log": "text",
  "application/x-parquet": "text",
  // Images
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/heic": "image",
  "image/heif": "image",
  "image/gif": "image",
  "image/tiff": "image",
  "image/bmp": "image",
  "image/x-ms-bmp": "image",
  "image/avif": "image",
  "image/svg+xml": "image",
  "image/x-tiff": "image",
  "application/pdf": "image",
  // EPS / AI (treated as image for conversion list; decode may be limited)
  "application/postscript": "image",
  "application/illustrator": "image",
  // Audio
  "audio/wav": "audio",
  "audio/wave": "audio",
  "audio/x-wav": "audio",
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/ogg": "audio",
  "audio/webm": "audio",
  "audio/flac": "audio",
  // Video
  "video/mp4": "video",
  "video/webm": "video",
  "video/ogg": "video",
  "video/x-msvideo": "video",
  "video/quicktime": "video",
  "video/x-matroska": "video",
  "video/x-ms-wmv": "video",
  "video/x-flv": "video",
};

const EXT_TO_CATEGORY: Record<string, FileCategory> = {
  txt: "text",
  csv: "text",
  json: "text",
  ndjson: "text",
  log: "text",
  parquet: "text",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  heic: "image",
  heif: "image",
  gif: "image",
  tiff: "image",
  tif: "image",
  bmp: "image",
  avif: "image",
  svg: "image",
  pdf: "image",
  eps: "image",
  ai: "image",
  nef: "image",
  cr2: "image",
  orf: "image",
  wav: "audio",
  mp3: "audio",
  ogg: "audio",
  flac: "audio",
  m4a: "audio",
  mp4: "video",
  webm: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  wmv: "video",
  flv: "video",
};

export function getFileCategory(file: File): FileCategory | null {
  const mime = file.type?.toLowerCase();
  if (mime && MIME_TO_CATEGORY[mime]) return MIME_TO_CATEGORY[mime];
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_CATEGORY[ext]) return EXT_TO_CATEGORY[ext];
  return null;
}

export function isAcceptedFile(file: File): boolean {
  return getFileCategory(file) !== null;
}

export const CATEGORY_LABELS: Record<FileCategory, string> = {
  text: "Text / Data",
  image: "Image",
  audio: "Audio",
  video: "Video",
};

/** Display order for menu optgroups */
export const FILE_CATEGORY_ORDER: FileCategory[] = ["text", "image", "audio", "video"];

/** One row per supported extension so the menu lists every ingredient we accept */
export interface MenuInputType {
  ext: string;
  label: string;
  category: FileCategory;
  mime: string;
}

const EXT_PROBE_MIME: Record<string, string> = {
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  ndjson: "application/x-ndjson",
  log: "text/x-log",
  parquet: "application/x-parquet",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  gif: "image/gif",
  tiff: "image/tiff",
  tif: "image/tiff",
  bmp: "image/bmp",
  avif: "image/avif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  eps: "application/postscript",
  ai: "application/illustrator",
  nef: "image/x-nikon-nef",
  cr2: "image/x-canon-cr2",
  orf: "image/x-olympus-orf",
  wav: "audio/wav",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
};

const EXT_MENU_LABEL: Record<string, string> = {
  txt: "Plain text (.txt)",
  csv: "CSV (.csv)",
  json: "JSON (.json)",
  ndjson: "NDJSON (.ndjson)",
  log: "Log (.log)",
  parquet: "Parquet (.parquet)",
  jpg: "JPEG (.jpg)",
  jpeg: "JPEG (.jpeg)",
  png: "PNG (.png)",
  webp: "WebP (.webp)",
  heic: "HEIC (.heic)",
  heif: "HEIF (.heif)",
  gif: "GIF (.gif)",
  tiff: "TIFF (.tiff)",
  tif: "TIFF (.tif)",
  bmp: "BMP (.bmp)",
  avif: "AVIF (.avif)",
  svg: "SVG (.svg)",
  pdf: "PDF (.pdf)",
  eps: "EPS (.eps)",
  ai: "Adobe Illustrator (.ai)",
  nef: "Nikon RAW (.nef)",
  cr2: "Canon RAW (.cr2)",
  orf: "Olympus RAW (.orf)",
  wav: "WAV (.wav)",
  mp3: "MP3 (.mp3)",
  ogg: "OGG (.ogg)",
  flac: "FLAC (.flac)",
  m4a: "M4A (.m4a)",
  mp4: "MP4 (.mp4)",
  webm: "WebM (.webm)",
  mov: "MOV (.mov)",
  avi: "AVI (.avi)",
  mkv: "MKV (.mkv)",
  wmv: "WMV (.wmv)",
  flv: "FLV (.flv)",
};

function buildMenuInputTypes(): MenuInputType[] {
  const exts = Object.keys(EXT_TO_CATEGORY) as string[];
  return exts.map((ext) => ({
    ext,
    label: EXT_MENU_LABEL[ext] ?? `${ext.toUpperCase()} (.${ext})`,
    category: EXT_TO_CATEGORY[ext]!,
    mime: EXT_PROBE_MIME[ext] ?? "application/octet-stream",
  }));
}

/** All supported input types for the menu, grouped by category (stable order) */
export function getMenuInputTypesByCategory(): Record<FileCategory, MenuInputType[]> {
  const all = buildMenuInputTypes();
  const grouped: Record<FileCategory, MenuInputType[]> = {
    text: [],
    image: [],
    audio: [],
    video: [],
  };
  for (const item of all) {
    grouped[item.category].push(item);
  }
  for (const cat of FILE_CATEGORY_ORDER) {
    grouped[cat].sort((a, b) => a.label.localeCompare(b.label));
  }
  return grouped;
}

/** Empty file used to resolve which brews apply to a menu selection (same rules as a real drop) */
export function createProbeFile(entry: MenuInputType): File {
  return new File([new Uint8Array(0)], `ingredient.${entry.ext}`, { type: entry.mime });
}
