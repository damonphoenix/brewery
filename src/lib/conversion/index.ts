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

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && typeof document !== "undefined" && "ontouchend" in document);
  const isSafari =
    /^((?!chrome|android|crios|fxios|edgios|opios).)*safari/i.test(ua);
  return isIos && isSafari;
}

/**
 * Trigger a download for the converted file.
 * - iOS Safari: use Web Share API (shows Save to Files) when available; otherwise
 *   fall back to the standard anchor flow (which may preview PDFs inline).
 * - Other browsers: programmatic anchor with `download` attribute.
 */
export async function triggerDownload(result: ConversionResult): Promise<void> {
  if (typeof window === "undefined") return;

  if (isIosSafari()) {
    try {
      const file = new File([result.blob], result.filename, { type: result.blob.type });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: result.filename });
        return;
      }
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.rel = "noopener";
  a.target = "_self";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
