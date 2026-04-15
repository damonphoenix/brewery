"use client";

import type { ConversionResult, ConversionCallbacks } from "./types";
import type { BrewId } from "../brews";

type ImageDataLike = {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
};

/** Load a blob (any format the browser can draw) into ImageData via canvas */
function blobToImageData(blob: Blob): Promise<ImageDataLike> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve({
          data: imageData.data,
          width: imageData.width,
          height: imageData.height,
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

async function decodeImage(
  buffer: ArrayBuffer,
  mime: string,
  fileName: string
): Promise<ImageDataLike> {
  const m = mime.toLowerCase().replace(/\/.*$/, "").trim();
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (mime === "image/jpeg" || mime === "image/jpg" || ext === "jpg" || ext === "jpeg") {
    const jpeg = await import("@jsquash/jpeg");
    return (await jpeg.decode(buffer as ArrayBuffer)) as unknown as ImageDataLike;
  }
  if (mime === "image/png" || ext === "png") {
    const png = await import("@jsquash/png");
    return (await png.decode(buffer as ArrayBuffer)) as unknown as ImageDataLike;
  }
  if (mime === "image/webp" || ext === "webp") {
    const webp = await import("@jsquash/webp");
    return (await webp.decode(buffer as ArrayBuffer)) as unknown as ImageDataLike;
  }
  if (mime === "image/avif" || ext === "avif") {
    try {
      const avif = await import("@jsquash/avif");
      const decoded = await avif.decode(buffer);
      if (decoded) return decoded as unknown as ImageDataLike;
    } catch {
      // fallback to canvas if WASM decode fails
    }
    return blobToImageData(new Blob([buffer], { type: "image/avif" }));
  }
  if (mime === "image/tiff" || mime === "image/x-tiff" || ext === "tiff" || ext === "tif") {
    const UTIF = (await import("utif")).default;
    const ifds = UTIF.decode(buffer);
    if (!ifds?.length) throw new Error("Invalid TIFF");
    const page = ifds[0];
    UTIF.decodeImage(buffer, page, ifds);
    const rgba = UTIF.toRGBA8(page) as Uint8Array;
    return {
      data: rgba,
      width: page.width,
      height: page.height,
    };
  }
  if (mime === "image/heic" || mime === "image/heif" || ext === "heic" || ext === "heif") {
    const heic2any = (await import("heic2any")).default;
    const blob = new Blob([buffer], { type: mime || "image/heic" });
    const result = await heic2any({ blob, toType: "image/png" });
    const out = Array.isArray(result) ? result[0] : result;
    return blobToImageData(out as Blob);
  }
  if (mime === "application/pdf" || ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    const pdf = await pdfjsLib.getDocument({
      data: buffer,
      useWorkerFetch: false,
    }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvasContext: canvas.getContext("2d")!,
      viewport,
    }).promise;
    const imageData = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
    return {
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
    };
  }

  // GIF, BMP, SVG, or other: use canvas
  const type = mime || (ext === "bmp" ? "image/bmp" : ext === "svg" ? "image/svg+xml" : "image/png");
  return blobToImageData(new Blob([buffer], { type }));
}

async function encodeImage(
  imageData: ImageDataLike,
  brewId: BrewId,
  _callbacks?: ConversionCallbacks
): Promise<{ blob: Blob; mime: string; ext: string }> {
  const { data, width, height } = imageData;
  const dataObj = { data, width, height };

  switch (brewId) {
    case "image-to-jpg": {
      const jpeg = await import("@jsquash/jpeg");
      const encoded = await jpeg.encode(dataObj as ImageData, { quality: 0.92 });
      return { blob: new Blob([encoded], { type: "image/jpeg" }), mime: "image/jpeg", ext: "jpg" };
    }
    case "image-to-png": {
      const png = await import("@jsquash/png");
      const encoded = await png.encode(dataObj as ImageData);
      return { blob: new Blob([encoded], { type: "image/png" }), mime: "image/png", ext: "png" };
    }
    case "image-to-webp": {
      const webp = await import("@jsquash/webp");
      const encoded = await webp.encode(dataObj as ImageData, { quality: 0.9 });
      return { blob: new Blob([encoded], { type: "image/webp" }), mime: "image/webp", ext: "webp" };
    }
    case "image-to-gif": {
      const gifenc = await import("gifenc");
      const palette = gifenc.quantize(data instanceof Uint8ClampedArray ? new Uint8Array(data.buffer) : data, 256);
      const index = gifenc.applyPalette(data instanceof Uint8ClampedArray ? new Uint8Array(data.buffer) : data, palette);
      const gif = gifenc.GIFEncoder();
      gif.writeFrame(index, width, height, { palette });
      gif.finish();
      return {
        blob: new Blob([gif.bytes()], { type: "image/gif" }),
        mime: "image/gif",
        ext: "gif",
      };
    }
    case "image-to-tiff": {
      const UTIF = (await import("utif")).default;
      const rgba = data instanceof Uint8ClampedArray ? new Uint8Array(data.buffer) : data;
      const tiff = UTIF.encodeImage(rgba, width, height);
      return {
        blob: new Blob([tiff], { type: "image/tiff" }),
        mime: "image/tiff",
        ext: "tiff",
      };
    }
    case "image-to-bmp": {
      const rgba = data instanceof Uint8ClampedArray ? new Uint8Array(data.buffer) : data;
      const rowSize = Math.ceil((width * 3) / 4) * 4;
      const pixelDataSize = rowSize * height;
      const fileSize = 14 + 40 + pixelDataSize;
      const buf = new ArrayBuffer(fileSize);
      const view = new DataView(buf);
      let off = 0;
      view.setUint8(off++, 0x42);
      view.setUint8(off++, 0x4d);
      view.setUint32(off, fileSize, true);
      off += 4;
      view.setUint32(off, 0, true);
      off += 4;
      view.setUint32(off, 54, true);
      off += 4;
      view.setUint32(off, 40, true);
      off += 4;
      view.setUint32(off, width, true);
      off += 4;
      view.setInt32(off, -height, true);
      off += 4;
      view.setUint16(off, 1, true);
      off += 2;
      view.setUint16(off, 24, true);
      off += 2;
      view.setUint32(off, 0, true);
      off += 4;
      view.setUint32(off, pixelDataSize, true);
      off += 4;
      const img = new Uint8Array(buf, 54);
      for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const o = (height - 1 - y) * rowSize + x * 3;
          img[o] = rgba[i + 2];
          img[o + 1] = rgba[i + 1];
          img[o + 2] = rgba[i];
        }
      }
      return { blob: new Blob([buf], { type: "image/bmp" }), mime: "image/bmp", ext: "bmp" };
    }
    case "image-to-avif": {
      const avif = await import("@jsquash/avif");
      const idata =
        data instanceof Uint8ClampedArray
          ? new ImageData(data, width, height)
          : new ImageData(new Uint8ClampedArray(data), width, height);
      const encoded = await avif.encode(idata, { speed: 4 });
      return { blob: new Blob([encoded], { type: "image/avif" }), mime: "image/avif", ext: "avif" };
    }
    case "image-to-heic": {
      throw new Error("HEIC encoding is not supported in the browser. Try PNG or JPEG.");
    }
    case "image-to-svg": {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      const imageDataObj = new ImageData(new Uint8ClampedArray(data.buffer as ArrayBuffer), width, height);
      ctx.putImageData(imageDataObj, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
</svg>`;
      return {
        blob: new Blob([svg], { type: "image/svg+xml" }),
        mime: "image/svg+xml",
        ext: "svg",
      };
    }
    case "image-to-pdf": {
      const { jsPDF } = await import("jspdf");
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      const imageDataObj = new ImageData(new Uint8ClampedArray(data.buffer as ArrayBuffer), width, height);
      ctx.putImageData(imageDataObj, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: [width, height] });
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      const pdfBlob = pdf.output("blob");
      return {
        blob: pdfBlob,
        mime: "application/pdf",
        ext: "pdf",
      };
    }
    default:
      throw new Error(`Unsupported image brew: ${brewId}`);
  }
}

const IMAGE_BREWS: BrewId[] = [
  "image-to-jpg",
  "image-to-png",
  "image-to-webp",
  "image-to-gif",
  "image-to-tiff",
  "image-to-bmp",
  "image-to-avif",
  "image-to-heic",
  "image-to-svg",
  "image-to-pdf",
];

export async function runImageConversion(
  brewId: BrewId,
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  if (!IMAGE_BREWS.includes(brewId)) throw new Error(`Unsupported image brew: ${brewId}`);

  callbacks?.onProgress?.(null);
  const buffer = await file.arrayBuffer();
  const mime = file.type || "";
  const imageData = await decodeImage(buffer, mime, file.name);
  callbacks?.onProgress?.(50);

  const { blob, mime: outMime, ext } = await encodeImage(imageData, brewId, callbacks);
  callbacks?.onProgress?.(100);

  const base = file.name.replace(/\.[^.]+$/, "") || "converted";
  return {
    blob,
    filename: `${base}.${ext}`,
    mimeType: outMime,
  };
}

export function isImageBrew(brewId: BrewId): boolean {
  return IMAGE_BREWS.includes(brewId);
}
