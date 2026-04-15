# Taverrn Project Summary

## Recent Activity
### 2026-03-19
- Started the Next.js development server using `npm run dev`.
- Verified that the application is correctly serving at `http://localhost:3000`.


## Overview
Taverrn is a web-based, client-side file conversion utility themed as a fantasy "Tavern". Users can drop "ingredients" (files) onto the "bar counter" to "brew" (convert) them into other formats. The conversion happens entirely in the browser using WebAssembly.

## Tech Stack
- **Framework:** Next.js (App Router), React 19.
- **Styling:** Tailwind CSS v4, Framer Motion for animations.
- **Database/Auth:** Drizzle ORM, `better-sqlite3`, NextAuth (Auth.js beta) with Drizzle adapter.
- **Processing (WASM):**
  - `@ffmpeg/ffmpeg` & `@ffmpeg/util` for media (video/audio transcodes, GIF conversion).
  - `@jsquash` libraries for image conversions (AVIF, JPEG, PNG, WebP).
  - `pdfjs-dist`, `jspdf`, `apache-arrow`, `parquet-wasm` for document/data conversions.

## Key Features
- **Client-Side Processing:** Files aren't uploaded to a server for conversion; all heavy lifting is done locally using WASM modules like FFmpeg to ensure privacy and avoid hosting costs.
- **Thematic UI:** Uses alehouse-inspired typography (`Fraunces`), warm colors (`accent-amber`), and playful terminology (files = ingredients, conversions = brews).
- **Tip Jar:** A post-conversion tipping UI to support the creators.
- **Support for Media limits:** Built-in safeguards preventing users from processing files larger than the browser can reasonably handle (e.g., a 100MB cap on media).

## Current State
The project currently successfully implements drag-and-drop file handling, lazy-loads FFmpeg for video/audio conversions, and displays thematic UI components like the `Logo`, `BarCounter`, and `TipJar`. Recent refinements include UI polishing, tip jar event handling adjustments, and design inspections to enhance the "premium" tavern feel.
