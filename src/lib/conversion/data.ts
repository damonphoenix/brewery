"use client";

import type { ConversionResult, ConversionCallbacks } from "./types";
import type { BrewId } from "../brews";

/** Lazy-loaded parquet-wasm + apache-arrow for JSON/CSV → Parquet */
async function getParquetWasm() {
  const [arrow, parquet] = await Promise.all([
    import("apache-arrow"),
    import("parquet-wasm/bundler"),
  ]);
  return { arrow, parquet };
}

function baseNameFromFile(file: File): string {
  return file.name.replace(/\.[^.]+$/, "") || "converted";
}

/** JSON array of objects → Parquet */
export async function jsonToParquet(
  file: File,
  _callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  const text = await file.text();
  let data: Record<string, unknown>[];
  try {
    const parsed = JSON.parse(text);
    data = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new Error("Invalid JSON. We couldn't parse this ingredient.");
  }
  if (data.length === 0) throw new Error("JSON array is empty.");

  const { arrow, parquet } = await getParquetWasm();
  const table = arrow.tableFromJSON(data as Record<string, unknown>[]);
  const ipcBytes = arrow.tableToIPC(table, "stream");
  const wasmTable = parquet.Table.fromIPCStream(ipcBytes);
  const writerProps = new parquet.WriterPropertiesBuilder()
    .setCompression(parquet.Compression.SNAPPY)
    .build();
  const parquetBytes = parquet.writeParquet(wasmTable, writerProps);
  const blob = new Blob([new Uint8Array(parquetBytes)], {
    type: "application/x-parquet",
  });
  return {
    blob,
    filename: `${baseNameFromFile(file)}.parquet`,
    mimeType: "application/x-parquet",
  };
}

/** JSON → CSV (pure JS) */
export async function jsonToCsv(
  file: File,
  _callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  const text = await file.text();
  let data: Record<string, unknown>[];
  try {
    const parsed = JSON.parse(text);
    data = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new Error("Invalid JSON. We couldn't parse this ingredient.");
  }
  if (data.length === 0) throw new Error("JSON array is empty.");

  const headers = [...new Set(data.flatMap((row) => Object.keys(row)))];
  const escape = (v: unknown): string => {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  return {
    blob,
    filename: `${baseNameFromFile(file)}.csv`,
    mimeType: "text/csv",
  };
}

/** CSV → Parquet (parse CSV to JSON-like rows, then use parquet) */
export async function csvToParquet(
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("CSV has no data rows.");
  const headers = parseCsvLine(lines[0]);
  const data: Record<string, string>[] = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
  callbacks?.onProgress?.(50);
  const { arrow, parquet } = await getParquetWasm();
  const table = arrow.tableFromJSON(
    data as unknown as Record<string, unknown>[]
  );
  const wasmTable = parquet.Table.fromIPCStream(
    arrow.tableToIPC(table, "stream")
  );
  const writerProps = new parquet.WriterPropertiesBuilder()
    .setCompression(parquet.Compression.SNAPPY)
    .build();
  const parquetBytes = parquet.writeParquet(wasmTable, writerProps);
  callbacks?.onProgress?.(100);
  const blob = new Blob([new Uint8Array(parquetBytes)], {
    type: "application/x-parquet",
  });
  return {
    blob,
    filename: `${baseNameFromFile(file)}.parquet`,
    mimeType: "application/x-parquet",
  };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || c === "\r") {
      out.push(current);
      current = "";
    } else if (c !== "\n") current += c;
  }
  out.push(current);
  return out;
}

/** CSV → JSON (pure JS) */
export async function csvToJson(
  file: File,
  _callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("CSV has no data rows.");
  const headers = parseCsvLine(lines[0]);
  const data = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  return {
    blob,
    filename: `${baseNameFromFile(file)}.json`,
    mimeType: "application/json",
  };
}

const DATA_CONVERTERS: Partial<Record<BrewId, (file: File, cb?: ConversionCallbacks) => Promise<ConversionResult>>> = {
  "json-to-parquet": jsonToParquet,
  "json-to-csv": jsonToCsv,
  "csv-to-parquet": csvToParquet,
  "csv-to-json": csvToJson,
};

export function runDataConversion(
  brewId: BrewId,
  file: File,
  callbacks?: ConversionCallbacks
): Promise<ConversionResult> {
  const fn = DATA_CONVERTERS[brewId];
  if (!fn) throw new Error(`Unsupported brew: ${brewId}`);
  return fn(file, callbacks);
}

export function isDataBrew(brewId: BrewId): boolean {
  return brewId in DATA_CONVERTERS;
}
