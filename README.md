# Brewery

> **Brew your files — 100% local, straight from the tap.**

Brewery is a privacy-first, browser-based file converter. Drop any supported file on the bar counter and convert it to another format — entirely on your device. No uploads. No servers. No data ever leaves your machine.

---

## How it works

1. **Drop your ingredient** — drag a file onto the bar counter, or click to browse
2. **Pick your brew** — choose the output format from the menu that appears
3. **Download** — your converted file is ready instantly

Everything runs in WebAssembly inside your browser tab.

---

## Supported formats

| Category | Input formats | Output formats |
|---|---|---|
| **Image** | JPG, PNG, WebP, GIF, TIFF, BMP, AVIF, HEIC, SVG, PDF | JPG, PNG, WebP, GIF, TIFF, BMP, AVIF, HEIC, SVG, PDF |
| **Audio** | MP3, WAV, OGG, FLAC, M4A | MP3, WAV, OGG, FLAC, M4A |
| **Video** | MP4, MOV, AVI, MKV, WebM, WMV, FLV | MP4, MOV, AVI, MKV, WebM, WMV, FLV, GIF, MP3, WAV |
| **Text / Data** | JSON, NDJSON, CSV, Parquet | JSON, CSV, Parquet |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Audio / Video | [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) |
| Image encoding | [@jsquash](https://github.com/nicolo-ribaudo/jSquash) (AVIF, WebP, JPEG, PNG) |
| Data formats | [parquet-wasm](https://github.com/kylebarron/parquet-wasm) + [Apache Arrow](https://arrow.apache.org/docs/js/) |
| Icons | [Lucide React](https://lucide.dev) |

---

## Privacy

Brewery processes everything client-side. No file content, metadata, or personal data is ever transmitted to any server. See [Privacy Policy](/privacy) for details.

---

## Contributing

Bug reports and feature requests are welcome.

- **Found a bug?** → [Open an issue](https://github.com/damonphoenix/Brewery/issues/new)
- **Want to contribute?** → Fork the repo, make your changes, and open a pull request

---

## Support

If Brewery saved you time, consider [buying a coffee](https://buymeacoffee.com/damonphoenix). ☕

---

## License

MIT © [Damon Phoenix](https://github.com/damonphoenix)
