/**
 * Brewery Extension — conversion/data.js
 * Direct port of src/lib/conversion/data.ts — handles JSON/CSV/Parquet conversions.
 * parquet-wasm + Apache Arrow loaded from extension/wasm/.
 */

const DATA_BREW_IDS = new Set([
  'txt-to-csv', 'txt-to-json',
  'json-to-parquet', 'json-to-csv', 'csv-to-parquet', 'csv-to-json', 'parquet-to-json', 'parquet-to-csv'
]);
export function isDataBrew(brewId) { return DATA_BREW_IDS.has(brewId); }

let _wasmMods = null;
async function getParquetWasm() {
  if (_wasmMods) return _wasmMods;
  const [arrow, parquet] = await Promise.all([
    import(chrome.runtime.getURL('wasm/arrow.mjs')),
    import(chrome.runtime.getURL('wasm/parquet.mjs')),
  ]);
  _wasmMods = { arrow, parquet };
  return _wasmMods;
}

function baseName(file) { return file.name.replace(/\.[^.]+$/, '') || 'converted'; }

async function parseAsJsonRows(file) {
  const text = (await file.text()).trim();
  try {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0) throw new Error('JSON array is empty.');
    return rows;
  } catch (e) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) throw new Error('File is empty.');
    try { return lines.map(l => JSON.parse(l)); }
    catch { throw e instanceof Error ? e : new Error('Invalid JSON. We couldn\'t parse this ingredient.'); }
  }
}

async function jsonToParquet(file) {
  const data = await parseAsJsonRows(file);
  const { arrow, parquet } = await getParquetWasm();
  const table = arrow.tableFromJSON(data);
  const ipcBytes = arrow.tableToIPC(table, 'stream');
  const wasmTable = parquet.Table.fromIPCStream(ipcBytes);
  const writerProps = new parquet.WriterPropertiesBuilder().setCompression(parquet.Compression.SNAPPY).build();
  const parquetBytes = parquet.writeParquet(wasmTable, writerProps);
  return { blob: new Blob([new Uint8Array(parquetBytes)], { type: 'application/x-parquet' }), filename: `${baseName(file)}.parquet`, mimeType: 'application/x-parquet' };
}

async function jsonToCsv(file) {
  const data = await parseAsJsonRows(file);
  const headers = [...new Set(data.flatMap(row => Object.keys(row)))];
  const escape = v => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(','), ...data.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
  return { blob: new Blob([csv], { type: 'text/csv' }), filename: `${baseName(file)}.csv`, mimeType: 'text/csv' };
}

function parseCsvLine(line) {
  const out = []; let current = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; }
    else if ((c === ',' && !inQuotes) || c === '\r') { out.push(current); current = ''; }
    else if (c !== '\n') current += c;
  }
  out.push(current); return out;
}

async function csvToParquet(file, callbacks) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV has no data rows.');
  const headers = parseCsvLine(lines[0]);
  const data = lines.slice(1).map(line => { const values = parseCsvLine(line); const row = {}; headers.forEach((h, i) => (row[h] = values[i] ?? '')); return row; });
  callbacks?.onProgress?.(50);
  const { arrow, parquet } = await getParquetWasm();
  const table = arrow.tableFromJSON(data);
  const wasmTable = parquet.Table.fromIPCStream(arrow.tableToIPC(table, 'stream'));
  const writerProps = new parquet.WriterPropertiesBuilder().setCompression(parquet.Compression.SNAPPY).build();
  const parquetBytes = parquet.writeParquet(wasmTable, writerProps);
  callbacks?.onProgress?.(100);
  return { blob: new Blob([new Uint8Array(parquetBytes)], { type: 'application/x-parquet' }), filename: `${baseName(file)}.parquet`, mimeType: 'application/x-parquet' };
}

async function csvToJson(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV has no data rows.');
  const headers = parseCsvLine(lines[0]);
  const data = lines.slice(1).map(line => { const values = parseCsvLine(line); const row = {}; headers.forEach((h, i) => (row[h] = values[i] ?? '')); return row; });
  return { blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename: `${baseName(file)}.json`, mimeType: 'application/json' };
}

async function parquetToJson(file, callbacks) {
  const { arrow, parquet } = await getParquetWasm();
  const bytes = new Uint8Array(await file.arrayBuffer());
  callbacks?.onProgress?.(30);
  const ipcBytes = parquet.readParquet(bytes);
  const table = arrow.tableFromIPC(ipcBytes);
  callbacks?.onProgress?.(70);
  const fields = table.schema.fields.map(f => f.name);
  const rows = [];
  for (let i = 0; i < table.numRows; i++) {
    const row = {}; for (const name of fields) row[name] = table.getChild(name)?.get(i) ?? null; rows.push(row);
  }
  callbacks?.onProgress?.(100);
  return { blob: new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }), filename: `${baseName(file)}.json`, mimeType: 'application/json' };
}

async function parquetToCsv(file, callbacks) {
  const { arrow, parquet } = await getParquetWasm();
  const bytes = new Uint8Array(await file.arrayBuffer());
  callbacks?.onProgress?.(30);
  const ipcBytes = parquet.readParquet(bytes);
  const table = arrow.tableFromIPC(ipcBytes);
  callbacks?.onProgress?.(70);
  const fields = table.schema.fields.map(f => f.name);
  const rows = [];
  for (let i = 0; i < table.numRows; i++) {
    const row = {}; for (const name of fields) row[name] = table.getChild(name)?.get(i) ?? null; rows.push(row);
  }
  const escape = v => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [fields.join(','), ...rows.map(row => fields.map(h => escape(row[h])).join(','))].join('\n');
  callbacks?.onProgress?.(100);
  return { blob: new Blob([csv], { type: 'text/csv' }), filename: `${baseName(file)}.csv`, mimeType: 'text/csv' };
}

async function txtToCsv(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  // Keep empty lines as empty strings, strip trailing newline
  const rows = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines;
  const escape = v => /[,"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const csv = ['line', ...rows.map(escape)].join('\n');
  return {
    blob: new Blob([csv], { type: 'text/csv' }),
    filename: `${baseName(file)}.csv`,
    mimeType: 'text/csv',
  };
}

async function txtToJson(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const rows = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines;
  return {
    blob: new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }),
    filename: `${baseName(file)}.json`,
    mimeType: 'application/json',
  };
}

const DATA_CONVERTERS = {
  'txt-to-csv':      txtToCsv,
  'txt-to-json':     txtToJson,
  'json-to-parquet': jsonToParquet,
  'json-to-csv':     jsonToCsv,
  'csv-to-parquet':  csvToParquet,
  'csv-to-json':     csvToJson,
  'parquet-to-json': parquetToJson,
  'parquet-to-csv':  parquetToCsv,
};

/**
 * @param {string} brewId
 * @param {File} file
 * @param {{ onProgress?: (p: number|null) => void }} [callbacks]
 */
export function runDataConversion(brewId, file, callbacks) {
  const fn = DATA_CONVERTERS[brewId];
  if (!fn) throw new Error(`Unsupported brew: ${brewId}`);
  return fn(file, callbacks);
}
