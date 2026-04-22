"use client";

import { useState } from "react";
import { ChevronDown, Coffee, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import { getBrewsForCategory, getBrewsForFile, type BrewDefinition, type BrewId } from "@/lib/brews";
import { CATEGORY_LABELS, type FileCategory } from "@/lib/fileTypes";

type CategoryRow = {
  category: FileCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  inputLabel: string;
  brews: BrewDefinition[];
};

const CATEGORY_ICONS: Record<FileCategory, React.ComponentType<{ className?: string }>> = {
  text: FileText,
  image: ImageIcon,
  audio: Music,
  video: Video,
};

/** "json, ndjson" → uppercase pill labels */
function inputLabelFor(category: FileCategory, brews: BrewDefinition[]): string {
  if (category === "text") {
    const exts = new Set<string>();
    for (const b of brews) (b.acceptsExtensions ?? []).forEach((e) => exts.add(e.toUpperCase()));
    return Array.from(exts).join(" · ");
  }
  const ext = category === "image"
    ? ["PNG", "JPG", "WEBP", "GIF", "TIFF", "BMP", "AVIF", "HEIC", "SVG", "PDF"]
    : category === "audio"
      ? ["MP3", "WAV", "OGG", "FLAC", "M4A"]
      : ["MP4", "MOV", "AVI", "MKV", "WEBM", "WMV", "FLV"];
  return ext.join(" · ");
}

function brewFromLabel(category: FileCategory, brew: BrewDefinition): string {
  if (category === "text") {
    const exts = (brew.acceptsExtensions ?? []).map((e) => e.toUpperCase());
    return exts.length ? exts.join(" / ") : "TEXT";
  }
  return CATEGORY_LABELS[category].toUpperCase();
}

function brewToLabel(brew: BrewDefinition): string {
  return `.${brew.outputExtension}`.toUpperCase();
}

function CategorySection({
  row,
  interactive,
  disabled,
  onSelectBrew,
}: {
  row: CategoryRow;
  interactive: boolean;
  disabled: boolean;
  onSelectBrew?: (brewId: BrewId) => void;
}) {
  const [open, setOpen] = useState(true);
  const Icon = row.icon;
  return (
    <div className="border-t border-[var(--accent-amber)]/15 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--accent-amber)]/5"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-amber)]/12 text-[var(--accent-amber)] ring-1 ring-[var(--accent-amber)]/25">
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1">
          <span
            className="block text-base font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {row.label}
          </span>
          <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent-amber-dim)]">
            {row.inputLabel}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--accent-amber-dim)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="grid grid-cols-1 gap-2 px-5 pb-6 pt-1 sm:grid-cols-2">
          {row.brews.map((b) => (
            <li key={b.id} className="relative">
              <button
                type="button"
                disabled={!interactive || disabled}
                onClick={() => onSelectBrew?.(b.id)}
                className={[
                  "group relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition-colors",
                  "border-[var(--accent-amber)]/18 bg-white/75 hover:border-[var(--accent-amber)]/45 hover:bg-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
                  (!interactive || disabled) ? "cursor-default opacity-85" : "cursor-pointer",
                ].join(" ")}
                aria-label={
                  interactive
                    ? `Convert ${brewFromLabel(row.category, b)} to ${brewToLabel(b)}`
                    : `${brewFromLabel(row.category, b)} to ${brewToLabel(b)}`
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold tracking-tight text-[var(--text-primary)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {brewFromLabel(row.category, b)}
                      </span>
                      <span className="text-xs text-[var(--accent-amber-dim)]" aria-hidden>
                        →
                      </span>
                      <span
                        className="text-sm font-semibold tracking-tight text-[var(--accent-amber)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {brewToLabel(b)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
                      {b.description}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-[var(--accent-amber)]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-amber-dim)] ring-1 ring-[var(--accent-amber)]/20">
                    Pour
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TavernMenu({
  file,
  category,
  onSelectBrew,
  disabled = false,
}: {
  file?: File | null;
  category?: FileCategory | null;
  onSelectBrew?: (brewId: BrewId) => void;
  disabled?: boolean;
}) {
  const interactive = !!file && !!category && !!onSelectBrew;

  const categories: CategoryRow[] = (["text", "image", "audio", "video"] as FileCategory[])
    .map((c) => {
      const brews = interactive && category === c ? getBrewsForFile(file!, c) : getBrewsForCategory(c);
      return {
        category: c,
        label: CATEGORY_LABELS[c],
        icon: CATEGORY_ICONS[c],
        inputLabel: inputLabelFor(c, getBrewsForCategory(c)),
        brews,
      };
    })
    .filter((r) => r.brews.length > 0);

  return (
    <section
      aria-label="Full menu of conversions"
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-[var(--accent-amber)]/30 shadow-[0_18px_70px_-40px_rgba(120,70,20,0.35)]"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(224,142,54,0.14) 0%, rgba(255,251,243,0.92) 40%, rgba(255,253,248,1) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.6  0 0 0 0 0.4  0 0 0 0 0.2  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* masthead */}
      <header className="relative px-6 pb-5 pt-7 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px flex-1 max-w-[60px] bg-[var(--accent-amber)]/30" />
          <Coffee className="h-4 w-4 text-[var(--accent-amber)]" aria-hidden />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent-amber)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {interactive ? "Your Order" : "Today’s Menu"}
          </span>
          <Coffee className="h-4 w-4 text-[var(--accent-amber)]" aria-hidden />
          <span className="h-px flex-1 max-w-[60px] bg-[var(--accent-amber)]/30" />
        </div>
        <h2
          className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {interactive ? "Pick a Brew" : "The House Menu"}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {interactive
            ? "Choose what to pour your ingredient into."
            : "Everything the brewery can pour — all recipes listed below."}
        </p>
      </header>

      <div className="relative mx-6 border-t-2 border-dashed border-[var(--accent-amber)]/25" />

      {/* categories */}
      <div className="relative">
        {categories.map((row) => (
          <CategorySection
            key={row.category}
            row={row}
            interactive={interactive && row.category === category}
            disabled={disabled}
            onSelectBrew={onSelectBrew}
          />
        ))}
      </div>

      {/* footer bar */}
      <footer className="relative flex items-center justify-center gap-2 border-t border-[var(--accent-amber)]/20 bg-[var(--accent-amber)]/5 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent-amber-dim)]">
        <span aria-hidden>✦</span>
        <span>Brewed fresh in your browser</span>
        <span aria-hidden>✦</span>
      </footer>
    </section>
  );
}
