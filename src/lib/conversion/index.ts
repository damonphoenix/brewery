"use client";

import type { BrewId } from "../brews";
import { getBrewById, isOverMediaLimit } from "../brews";
import type { ConversionResult, ConversionCallbacks } from "./types";
import { runDataConversion, isDataBrew } from "./data";
import { runImageConversion, isImageBrew } from "./image";
import { runMediaConversion, isMediaBrew } from "./media";

export type { ConversionResult, ConversionProgress, ConversionCallbacks } from "./types";

/**
 * Run conversion for the given brew. Enforces 100MB cap for media brews.
 * Lazy-loads the appropriate WASM engine.
 */
export async function runConversion(
  brewId: BrewId,
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  const brew = getBrewById(brewId);
  if (!brew) throw new Error(`Unknown brew: ${brewId}`);

  if (brew.isMedia && isOverMediaLimit(file.size, brew))
    throw new Error(
      `This ingredient is over 100MB. We can't brew such a large file - please use a shorter clip.`
    );

  if (isDataBrew(brewId)) return runDataConversion(brewId, file, callbacks);
  if (isImageBrew(brewId)) return runImageConversion(brewId, file, callbacks);
  if (isMediaBrew(brewId)) return runMediaConversion(brewId, file, callbacks);

  throw new Error(`Unsupported brew: ${brewId}`);
}

export function triggerDownload(result: ConversionResult): void {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}
