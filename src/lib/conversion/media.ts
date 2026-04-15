"use client";

import type { ConversionResult, ConversionCallbacks } from "./types";
import type { BrewId } from "../brews";
import { getBrewById, MAX_MEDIA_SIZE_MB } from "../brews";

const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

async function getFFmpeg(callbacks?: ConversionCallbacks) {
  const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    import("@ffmpeg/util"),
  ]);
  const ffmpeg = new FFmpeg();
  if (callbacks?.onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      const pct =
        typeof progress === "number"
          ? Math.round(progress * 100)
          : null;
      callbacks.onProgress?.(pct ?? null);
    });
  }

  const baseURL = window.location.origin + "/wasm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return { ffmpeg, fetchFile };
}

/** Generic video-to-video (mov, mp4, webm, avi, mkv, wmv, flv) */
async function convertVideoTo(
  file: File,
  outputExtension: string,
  outputMime: string,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  if (file.size > MAX_MEDIA_BYTES)
    throw new Error(
      `File is over ${MAX_MEDIA_SIZE_MB}MB. We can't brew such a large ingredient—please use a shorter clip.`
    );

  callbacks?.onProgress?.(null);
  const { ffmpeg, fetchFile } = await getFFmpeg(callbacks);
  const inputExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `input.${inputExt}`;
  const outputName = `output.${outputExtension}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  const code = await ffmpeg.exec(["-i", inputName, "-c", "copy", outputName]);
  if (code !== 0) {
    const codeReencode = await ffmpeg.exec(["-i", inputName, outputName]);
    if (codeReencode !== 0)
      throw new Error("Conversion failed. The ingredient may be corrupted.");
  }
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob(
    [data instanceof Uint8Array ? new Uint8Array(data) : data],
    { type: outputMime }
  );
  const base = file.name.replace(/\.[^.]+$/, "") || "converted";
  callbacks?.onProgress?.(100);
  return {
    blob,
    filename: `${base}.${outputExtension}`,
    mimeType: outputMime,
  };
}

/** Extract audio from video file to MP3 or WAV */
export async function extractAudioFromVideo(
  file: File,
  outputExtension: "mp3" | "wav",
  outputMime: string,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  if (file.size > MAX_MEDIA_BYTES)
    throw new Error(
      `File is over ${MAX_MEDIA_SIZE_MB}MB. We can't brew such a large ingredient - please use a shorter clip.`
    );

  callbacks?.onProgress?.(null);
  const { ffmpeg, fetchFile } = await getFFmpeg(callbacks);
  const inputExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `input.${inputExt}`;
  const outputName = `output.${outputExtension}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // -vn removes video stream, -acodec specifies encoder
  const args = ["-i", inputName, "-vn"];
  if (outputExtension === "mp3") {
    args.push("-acodec", "libmp3lame", "-q:a", "2");
  } else {
    // pcm_s16le is standard 16-bit WAV
    args.push("-acodec", "pcm_s16le");
  }
  args.push(outputName);

  const code = await ffmpeg.exec(args);
  if (code !== 0) throw new Error("Audio extraction failed. The ingredient may be corrupted.");

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob(
    [data instanceof Uint8Array ? new Uint8Array(data) : data],
    { type: outputMime }
  );

  const base = file.name.replace(/\.[^.]+$/, "") || "extracted";
  callbacks?.onProgress?.(100);

  return {
    blob,
    filename: `${base}.${outputExtension}`,
    mimeType: outputMime,
  };
}

export async function wavToMp3(
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  if (file.size > MAX_MEDIA_BYTES)
    throw new Error(
      `File is over ${MAX_MEDIA_SIZE_MB}MB. We can't brew such a large ingredient—please use a shorter clip.`
    );

  callbacks?.onProgress?.(null);
  const { ffmpeg, fetchFile } = await getFFmpeg(callbacks);
  const inputName = "input.wav";
  const outputName = "output.mp3";
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  const code = await ffmpeg.exec([
    "-i",
    inputName,
    "-acodec",
    "libmp3lame",
    "-q:a",
    "2",
    outputName,
  ]);
  if (code !== 0) throw new Error("Conversion failed. The ingredient may be corrupted.");
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob(
    [data instanceof Uint8Array ? new Uint8Array(data) : data],
    { type: "audio/mpeg" }
  );
  const base = file.name.replace(/\.[^.]+$/, "") || "converted";
  callbacks?.onProgress?.(100);
  return {
    blob,
    filename: `${base}.mp3`,
    mimeType: "audio/mpeg",
  };
}

export async function mp4ToGif(
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  if (file.size > MAX_MEDIA_BYTES)
    throw new Error(
      `File is over ${MAX_MEDIA_SIZE_MB}MB. We can't brew such a large ingredient—please use a shorter clip.`
    );

  callbacks?.onProgress?.(null);
  const { ffmpeg, fetchFile } = await getFFmpeg(callbacks);
  const inputExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `input.${inputExt}`;
  const outputName = "output.gif";
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  const code = await ffmpeg.exec([
    "-i",
    inputName,
    "-vf",
    "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
    "-loop",
    "0",
    outputName,
  ]);
  if (code !== 0) throw new Error("Conversion failed. The ingredient may be corrupted.");
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob(
    [data instanceof Uint8Array ? new Uint8Array(data) : data],
    { type: "image/gif" }
  );
  const base = file.name.replace(/\.[^.]+$/, "") || "converted";
  callbacks?.onProgress?.(100);
  return {
    blob,
    filename: `${base}.gif`,
    mimeType: "image/gif",
  };
}

const VIDEO_TO_FORMAT_IDS: BrewId[] = [
  "video-to-mov",
  "video-to-mp4",
  "video-to-webm",
  "video-to-avi",
  "video-to-mkv",
  "video-to-wmv",
  "video-to-flv",
];

const VIDEO_TO_AUDIO_IDS: BrewId[] = [
  "video-to-mp3",
  "video-to-wav",
];

export function runMediaConversion(
  brewId: BrewId,
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  if (file.size > MAX_MEDIA_BYTES)
    throw new Error(
      `File is over ${MAX_MEDIA_SIZE_MB}MB. We can't brew such a large ingredient—please use a shorter clip.`
    );

  if (brewId === "wav-to-mp3") return wavToMp3(file, callbacks);
  if (brewId === "mp4-to-gif") return mp4ToGif(file, callbacks);

  // Video extracting to audio
  if (VIDEO_TO_AUDIO_IDS.includes(brewId)) {
    const brew = getBrewById(brewId);
    if (!brew) throw new Error(`Unsupported media brew: ${brewId}`);
    return extractAudioFromVideo(file, brew.outputExtension as "mp3" | "wav", brew.outputMime, callbacks);
  }

  // Video transcodes (v2v)
  if (VIDEO_TO_FORMAT_IDS.includes(brewId)) {
    const brew = getBrewById(brewId);
    if (!brew) throw new Error(`Unsupported media brew: ${brewId}`);
    return convertVideoTo(file, brew.outputExtension, brew.outputMime, callbacks);
  }

  throw new Error(`Unsupported media brew: ${brewId}`);
}

export function isMediaBrew(brewId: BrewId): boolean {
  return (
    brewId === "wav-to-mp3" ||
    brewId === "mp4-to-gif" ||
    VIDEO_TO_FORMAT_IDS.includes(brewId) ||
    VIDEO_TO_AUDIO_IDS.includes(brewId)
  );
}
