#!/usr/bin/env node
/**
 * Brewery — scripts/prepare-extension.mjs
 * Copies required WASM binaries and JS modules from node_modules into extension/wasm/.
 * Run once after `npm install`: node scripts/prepare-extension.mjs
 */

import { copyFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const wasmDir = path.join(root, 'extension', 'wasm');

await mkdir(wasmDir, { recursive: true });

async function copy(src, dest) {
  const srcPath = path.join(root, src);
  const destPath = path.join(wasmDir, dest);
  if (!existsSync(srcPath)) {
    console.warn(`⚠️  Not found (skipping): ${src}`);
    return;
  }
  await copyFile(srcPath, destPath);
  console.log(`✓ ${dest}`);
}

console.log('🍺 Brewery — Preparing extension WASM assets...\n');

// ── FFmpeg core ──────────────────────────────────────────────────────────────
await copy('node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js', 'ffmpeg-core.js');
await copy('node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm', 'ffmpeg-core.wasm');

// ── FFmpeg JS modules ────────────────────────────────────────────────────────
await copy('node_modules/@ffmpeg/ffmpeg/dist/esm/index.js', 'ffmpeg.mjs');
await copy('node_modules/@ffmpeg/util/dist/esm/index.js', 'ffmpeg-util.mjs');

// ── jsquash WASM + JS ────────────────────────────────────────────────────────
const jsquashPkgs = [
  { pkg: '@jsquash/jpeg',  wasm: 'codec/enc/mozjpeg_enc.wasm', js: 'codec/enc/mozjpeg_enc.js', wasmOut: 'jpeg.wasm', jsOut: 'jpeg.mjs' },
  { pkg: '@jsquash/png',   wasm: 'codec/squoosh_png.wasm',      js: 'codec/squoosh_png.js',      wasmOut: 'png.wasm',  jsOut: 'png.mjs'  },
  { pkg: '@jsquash/webp',  wasm: 'codec/enc/webp_enc.wasm',     js: 'codec/enc/webp_enc.js',     wasmOut: 'webp.wasm', jsOut: 'webp.mjs' },
  { pkg: '@jsquash/avif',  wasm: 'codec/enc/avif_enc.wasm',     js: 'codec/enc/avif_enc.js',     wasmOut: 'avif.wasm', jsOut: 'avif.mjs' },
];

for (const { pkg, wasm, js, wasmOut, jsOut } of jsquashPkgs) {
  // Try to find the actual paths in node_modules
  const pkgDir = path.join(root, 'node_modules', pkg);
  if (!existsSync(pkgDir)) { console.warn(`⚠️  ${pkg} not installed, skipping`); continue; }

  // List all .wasm files in the package
  const wasmFiles = await findFiles(pkgDir, '.wasm');
  const jsFiles = await findFiles(pkgDir, '.js');

  if (wasmFiles.length > 0) {
    await copyFile(wasmFiles[0], path.join(wasmDir, wasmOut));
    console.log(`✓ ${wasmOut} (from ${path.relative(root, wasmFiles[0])})`);
  }
  // Copy the main ESM bundle
  const pkgJson = JSON.parse(await (await import('fs')).promises.readFile(path.join(pkgDir, 'package.json'), 'utf-8').catch(() => '{}'));
  const esmEntry = pkgJson.module || pkgJson.exports?.import || pkgJson.main;
  if (esmEntry) {
    const esmPath = path.join(pkgDir, esmEntry);
    if (existsSync(esmPath)) {
      await copyFile(esmPath, path.join(wasmDir, jsOut));
      console.log(`✓ ${jsOut}`);
    }
  }
}

// ── Apache Arrow ESM ─────────────────────────────────────────────────────────
await copy('node_modules/apache-arrow/Arrow.dom.mjs', 'arrow.mjs');

// ── parquet-wasm ─────────────────────────────────────────────────────────────
// parquet-wasm ships a bundler build with ESM
const parquetDir = path.join(root, 'node_modules', 'parquet-wasm');
if (existsSync(parquetDir)) {
  const parquetWasm = await findFiles(parquetDir, '.wasm');
  if (parquetWasm.length) {
    await copyFile(parquetWasm[0], path.join(wasmDir, 'parquet.wasm'));
    console.log('✓ parquet.wasm');
  }
  // Main ESM
  await copy('node_modules/parquet-wasm/bundler/parquet_wasm.js', 'parquet.mjs');
}

// ── gifenc ───────────────────────────────────────────────────────────────────
await copy('node_modules/gifenc/dist/gifenc.module.js', 'gifenc.mjs');

// ── utif ─────────────────────────────────────────────────────────────────────
await copy('node_modules/utif/UTIF.js', 'utif.js');

// ── jsPDF ────────────────────────────────────────────────────────────────────
await copy('node_modules/jspdf/dist/jspdf.es.min.js', 'jspdf.mjs');

console.log('\n✅ Extension WASM assets ready in extension/wasm/');
console.log('   Load extension/  as an unpacked extension in Chrome to test.\n');

// ── Helpers ──────────────────────────────────────────────────────────────────
async function findFiles(dir, ext) {
  const results = [];
  async function walk(d) {
    const entries = await readdir(d, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(ext)) results.push(full);
    }
  }
  await walk(dir);
  return results;
}
