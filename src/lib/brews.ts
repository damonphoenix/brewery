import type { FileCategory } from "./fileTypes";

export type BrewId =
  | "json-to-parquet"
  | "json-to-csv"
  | "csv-to-parquet"
  | "csv-to-json"
  | "image-to-jpg"
  | "image-to-png"
  | "image-to-webp"
  | "image-to-gif"
  | "image-to-tiff"
  | "image-to-bmp"
  | "image-to-avif"
  | "image-to-heic"
  | "image-to-svg"
  | "image-to-pdf"
  | "wav-to-mp3"
  | "mp4-to-gif"
  | "video-to-mov"
  | "video-to-mp4"
  | "video-to-webm"
  | "video-to-avi"
  | "video-to-mkv"
  | "video-to-wmv"
  | "video-to-flv"
  | "video-to-mp3"
  | "video-to-wav";

export interface BrewDefinition {
  id: BrewId;
  label: string;
  description: string;
  outputMime: string;
  outputExtension: string;
  /** Media brews (audio/video) enforce 100MB cap */
  isMedia: boolean;
}

const BREWS: Record<FileCategory, BrewDefinition[]> = {
  text: [
    {
      id: "json-to-parquet",
      label: "Parquet",
      description: "Columnar format for analytics",
      outputMime: "application/x-parquet",
      outputExtension: "parquet",
      isMedia: false,
    },
    {
      id: "json-to-csv",
      label: "CSV",
      description: "Comma-separated values",
      outputMime: "text/csv",
      outputExtension: "csv",
      isMedia: false,
    },
    {
      id: "csv-to-parquet",
      label: "Parquet",
      description: "Columnar format for analytics",
      outputMime: "application/x-parquet",
      outputExtension: "parquet",
      isMedia: false,
    },
    {
      id: "csv-to-json",
      label: "JSON",
      description: "JSON array or NDJSON",
      outputMime: "application/json",
      outputExtension: "json",
      isMedia: false,
    },
  ],
  image: [
    { id: "image-to-jpg", label: "JPG", description: "JPEG (lossy)", outputMime: "image/jpeg", outputExtension: "jpg", isMedia: false },
    { id: "image-to-png", label: "PNG", description: "PNG (lossless, transparency)", outputMime: "image/png", outputExtension: "png", isMedia: false },
    { id: "image-to-webp", label: "WebP", description: "WebP (modern web)", outputMime: "image/webp", outputExtension: "webp", isMedia: false },
    { id: "image-to-gif", label: "GIF", description: "GIF (256 colors, animation)", outputMime: "image/gif", outputExtension: "gif", isMedia: false },
    { id: "image-to-tiff", label: "TIFF", description: "TIFF (print quality)", outputMime: "image/tiff", outputExtension: "tiff", isMedia: false },
    { id: "image-to-bmp", label: "BMP", description: "BMP (uncompressed)", outputMime: "image/bmp", outputExtension: "bmp", isMedia: false },
    { id: "image-to-avif", label: "AVIF", description: "AVIF (efficient)", outputMime: "image/avif", outputExtension: "avif", isMedia: false },
    { id: "image-to-heic", label: "HEIC", description: "HEIC (Apple)", outputMime: "image/heic", outputExtension: "heic", isMedia: false },
    { id: "image-to-svg", label: "SVG", description: "SVG (vector wrapper)", outputMime: "image/svg+xml", outputExtension: "svg", isMedia: false },
    { id: "image-to-pdf", label: "PDF", description: "PDF (single page)", outputMime: "application/pdf", outputExtension: "pdf", isMedia: false },
  ],
  audio: [
    {
      id: "wav-to-mp3",
      label: "MP3",
      description: "Compressed audio (max 100MB)",
      outputMime: "audio/mpeg",
      outputExtension: "mp3",
      isMedia: true,
    },
  ],
  video: [
    {
      id: "mp4-to-gif",
      label: "GIF",
      description: "Animated GIF (max 100MB)",
      outputMime: "image/gif",
      outputExtension: "gif",
      isMedia: true,
    },
    {
      id: "video-to-mov",
      label: "MOV",
      description: "QuickTime (max 100MB)",
      outputMime: "video/quicktime",
      outputExtension: "mov",
      isMedia: true,
    },
    {
      id: "video-to-mp4",
      label: "MP4",
      description: "MPEG-4 (max 100MB)",
      outputMime: "video/mp4",
      outputExtension: "mp4",
      isMedia: true,
    },
    {
      id: "video-to-webm",
      label: "WebM",
      description: "WebM (max 100MB)",
      outputMime: "video/webm",
      outputExtension: "webm",
      isMedia: true,
    },
    {
      id: "video-to-avi",
      label: "AVI",
      description: "AVI (max 100MB)",
      outputMime: "video/x-msvideo",
      outputExtension: "avi",
      isMedia: true,
    },
    {
      id: "video-to-mkv",
      label: "MKV",
      description: "Matroska (max 100MB)",
      outputMime: "video/x-matroska",
      outputExtension: "mkv",
      isMedia: true,
    },
    {
      id: "video-to-wmv",
      label: "WMV",
      description: "Windows Media (max 100MB)",
      outputMime: "video/x-ms-wmv",
      outputExtension: "wmv",
      isMedia: true,
    },
    {
      id: "video-to-flv",
      label: "FLV",
      description: "Flash Video (max 100MB)",
      outputMime: "video/x-flv",
      outputExtension: "flv",
      isMedia: true,
    },
    {
      id: "video-to-mp3",
      label: "Extract MP3",
      description: "Audio only (max 100MB)",
      outputMime: "audio/mpeg",
      outputExtension: "mp3",
      isMedia: true,
    },
    {
      id: "video-to-wav",
      label: "Extract WAV",
      description: "Audio only (max 100MB)",
      outputMime: "audio/wav",
      outputExtension: "wav",
      isMedia: true,
    },
  ],
};

const MAX_MEDIA_BYTES = 100 * 1024 * 1024; // 100MB

/** Normalize MIME for comparison (e.g. image/jpg -> image/jpeg) */
function normalizeMime(mime: string): string {
  const n = mime?.toLowerCase().trim() || "";
  if (n === "image/jpg") return "image/jpeg";
  if (n === "audio/mp3") return "audio/mpeg";
  return n;
}

/** Equivalent extensions (same format, no conversion offered) */
const EQUIVALENT_EXT: Record<string, string[]> = {
  tiff: ["tif"],
  tif: ["tiff"],
  jpg: ["jpeg"],
  jpeg: ["jpg"],
};

/** True if the brew's output is the same format as the file (no point converting PNG to PNG) */
function outputMatchesFile(file: File, brew: BrewDefinition): boolean {
  const mime = normalizeMime(file.type || "");
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const outExt = brew.outputExtension.toLowerCase();
  if (outExt === ext) return true;
  const equiv = EQUIVALENT_EXT[outExt];
  if (equiv?.includes(ext)) return true;
  return normalizeMime(brew.outputMime) === mime;
}

export function getBrewsForCategory(category: FileCategory): BrewDefinition[] {
  return BREWS[category] ?? [];
}

/** Brews that actually convert to a different format (excludes same-in-as-out) */
export function getBrewsForFile(file: File, category: FileCategory): BrewDefinition[] {
  const all = getBrewsForCategory(category);
  return all.filter((brew) => !outputMatchesFile(file, brew));
}

export function getBrewById(id: BrewId): BrewDefinition | undefined {
  return (Object.values(BREWS) as BrewDefinition[][]).flat().find((b) => b.id === id);
}

export function isOverMediaLimit(fileSize: number, brew: BrewDefinition): boolean {
  return brew.isMedia && fileSize > MAX_MEDIA_BYTES;
}

export const MAX_MEDIA_SIZE_MB = 100;
