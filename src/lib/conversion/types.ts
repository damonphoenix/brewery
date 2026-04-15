export interface ConversionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export type ConversionProgress = number | null; // 0-100 or null for indeterminate

export interface ConversionCallbacks {
  onProgress?: (progress: ConversionProgress) => void;
}
