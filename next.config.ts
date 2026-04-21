import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages
  output: "export",
  // Required for static export — Next.js image optimisation needs a server
  images: { unoptimized: true },
  // COEP/COOP headers for SharedArrayBuffer (FFmpeg.wasm) are applied via
  // public/_headers (Cloudflare Pages respects that file for static assets).
  // headers() is ignored for static exports.

  // Keep heavy WASM / native packages out of the server-side pre-render.
  // They are all "use client" dynamic imports that only run in the browser.
  serverExternalPackages: [
    "@ffmpeg/ffmpeg",
    "@ffmpeg/util",
    "parquet-wasm",
    "apache-arrow",
    "@jsquash/avif",
    "@jsquash/jpeg",
    "@jsquash/png",
    "@jsquash/webp",
    "heic2any",
    "utif",
    "gifenc",
    "jspdf",
    "pdfjs-dist",
    "better-sqlite3",
  ],
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;