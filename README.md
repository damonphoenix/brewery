# Taverrn

> Brew your files — 100% local, straight from the tap.

Taverrn is a browser-based file converter. Drop any file on the bar counter and convert it to another format without ever leaving your device. No uploads, no servers, no data leaving your machine.

## Features

- **100% local processing** — WASM-powered conversions run entirely in your browser
- **Images** — JPG, PNG, WebP, GIF, TIFF, BMP, AVIF, HEIC, SVG, PDF, RAW formats
- **Audio** — WAV, MP3, OGG, FLAC, M4A
- **Video** — MP4, WebM, MOV, AVI, MKV, WMV, FLV + audio extraction
- **Text / Data** — JSON, CSV, Parquet, NDJSON, log files

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for audio/video
- [Drizzle ORM](https://orm.drizzle.team/) (schema ready, auth removed for now)
