"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Image,
  Music,
  Upload,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { getFileCategory, CATEGORY_LABELS, type FileCategory } from "@/lib/fileTypes";
import { type BrewId, getBrewsForFile } from "@/lib/brews";
import { runConversion, triggerDownload } from "@/lib/conversion";
import { BrewingProgress } from "@/components/BrewingProgress";
import { TipJar } from "@/components/TipJar";
import { saveFile, loadFile, clearFile } from "@/lib/storage";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BreweryMenu } from "@/components/BreweryMenu";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<FileCategory, React.ComponentType<{ className?: string }>> = {
  text: FileText,
  image: Image,
  audio: Music,
  video: Video,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const THEMATIC_ERRORS = {
  noFile: "We couldn't find a proper ingredient. Please drop a single file onto the counter.",
  multiple: "One ingredient at a time, please. Drop a single file and we'll brew it.",
  unsupported:
    "We don't recognise this ingredient. Try a text, image, audio, or video file.",
  invalid:
    "We can't quite read this brew. Ensure your ingredient is a valid, uncorrupted file.",
} as const;

function processFileList(
  files: FileList | null
): { file: File; category: FileCategory } | { error: keyof typeof THEMATIC_ERRORS } {
  if (!files?.length) return { error: "noFile" };
  if (files.length > 1) return { error: "multiple" };
  const file = files[0];
  const category = getFileCategory(file);
  if (!category) return { error: "unsupported" };
  return { file, category };
}

function createFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  return dt.files;
}

/* ─── component ───────────────────────────────────────────────────────────── */

export function BarCounter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState<FileCategory | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewProgress, setBrewProgress] = useState<number | null>(null);
  const [brewError, setBrewError] = useState<string | null>(null);
  const [showTipJar, setShowTipJar] = useState(false);
  const [lastFileName, setLastFileName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* restore persisted file */
  useEffect(() => {
    loadFile()
      .then((stored) => {
        if (stored) {
          const cat = getFileCategory(stored);
          if (cat) {
            setFile(stored);
            setFileCategory(cat);
          }
        }
      })
      .catch(() => {});
  }, []);

  /* scroll to brew menu when file becomes ready */
  useEffect(() => {
    if (file && fileCategory && menuRef.current) {
      setTimeout(() => {
        menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [file, fileCategory]);

  const handleFiles = useCallback((files: FileList | null) => {
    const result = processFileList(files);
    if ("error" in result) {
      setDropError(THEMATIC_ERRORS[result.error]);
      setFile(null);
      setFileCategory(null);
      return;
    }
    setFile(result.file);
    setFileCategory(result.category);
    setDropError(null);
    setBrewError(null);
    setShowTipJar(false);
    saveFile(result.file).catch(() => {});
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      const items = e.dataTransfer?.items;
      if (items) {
        const list: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === "file") list.push(item.getAsFile()!);
        }
        handleFiles(list.length ? createFileList(list) : null);
      } else {
        handleFiles(e.dataTransfer?.files ?? null);
      }
    },
    [handleFiles]
  );

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const onClickDropzone = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleClearFile = useCallback(async () => {
    setFile(null);
    setFileCategory(null);
    setDropError(null);
    setBrewError(null);
    setShowTipJar(false);
    clearFile().catch(() => {});
  }, []);

  const handleBrewSelect = useCallback(
    async (brewId: BrewId) => {
      if (!file) return;
      setBrewError(null);
      setIsBrewing(true);
      setBrewProgress(null);
      try {
        const result = await runConversion(brewId, file, { onProgress: setBrewProgress });
        await triggerDownload(result);
        setLastFileName(file.name);
        setShowTipJar(true);
        setTimeout(() => {
          setFile(null);
          setFileCategory(null);
        }, 500);
      } catch (e) {
        setBrewError(
          e instanceof Error
            ? e.message
            : "We couldn't finish this brew. Ensure your ingredient is valid and try again."
        );
      } finally {
        setIsBrewing(false);
        setBrewProgress(null);
      }
    },
    [file]
  );

  const hasFile = !!file && !!fileCategory;
  const Icon = fileCategory ? CATEGORY_ICONS[fileCategory] : null;
  const availableBrews = hasFile ? getBrewsForFile(file!, fileCategory!) : [];

  /* ── drop zone content ── */
  let dropzoneContent: React.ReactNode;

  if (showTipJar) {
    dropzoneContent = (
      <motion.div
        key="tip-jar"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
        className="w-full"
      >
        <TipJar fileName={lastFileName} onClose={() => setShowTipJar(false)} />
      </motion.div>
    );
  } else if (hasFile) {
    dropzoneContent = (
      <motion.div
        key="confirmed"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
        className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3 px-6 py-10"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "tween", ease: [0.77, 0, 0.175, 1], duration: 0.6 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
        >
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </motion.div>

        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--accent-amber)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          )}
          <p
            className="max-w-[18rem] truncate text-base font-medium text-[var(--text-primary)]"
            
            title={file.name}
          >
            {file.name}
          </p>
        </div>

        <p className="text-xs text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-sans-ui)" }}>
          {formatBytes(file.size)} · {CATEGORY_LABELS[fileCategory]}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClearFile();
          }}
          className="mt-1 flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-amber)]/30 hover:text-[var(--accent-amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)]"
          style={{ fontFamily: "var(--font-sans-ui)" }}
        >
          <X className="h-3 w-3" aria-hidden />
          Change file
        </button>
      </motion.div>
    );
  } else {
    dropzoneContent = (
      <motion.div
        key="idle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
        className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 px-6 py-12 sm:min-h-[320px]"
      >
        <motion.div
          animate={{ scale: 1, y: isDragActive ? -2 : 0 }}
          transition={{ type: "tween", ease: [0.77, 0, 0.175, 1], duration: 0.6 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-amber)]/15 text-[var(--accent-amber)] ring-1 ring-[var(--accent-amber)]/20 sm:h-20 sm:w-20"
        >
          <Upload className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
        </motion.div>
        <p
          className="text-center text-xl font-medium text-[var(--text-primary)] sm:text-2xl"
          
        >
          {isDragActive ? "Release to drop your ingredients" : "Drop your ingredients here"}
        </p>
        <p className="text-center text-sm text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-sans-ui)" }}>
          or click inside the box to browse
        </p>
      </motion.div>
    );
  }

  return (
    <section aria-label="Drop your file on the bar counter" className="w-full max-w-xl lg:max-w-4xl mx-auto">
      <VisuallyHidden>
        <input
          ref={inputRef}
          type="file"
          tabIndex={-1}
          aria-label="Choose a file to convert"
          onChange={onFileInputChange}
          className="sr-only"
        />
      </VisuallyHidden>

      {/* ── Drop zone ── */}
      <motion.div
        role="button"
        tabIndex={0}
        onClick={hasFile ? undefined : onClickDropzone}
        onKeyDown={(e) => {
          if (!hasFile && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClickDropzone();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label={hasFile ? `Ingredient loaded: ${file?.name}` : "Drop your ingredients here or click to browse"}
        aria-describedby={dropError ? "bar-drop-error" : undefined}
        className="relative select-none overflow-hidden rounded-[2rem] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] "
        style={{ cursor: hasFile ? "default" : "pointer", WebkitBackdropFilter: "blur(64px)", backdropFilter: "blur(64px)" }}
        animate={{
          scale: 1, opacity: isDragActive ? 0.95 : 1,
          borderColor: hasFile
            ? "rgba(16,185,129,0.35)"
            : isDragActive
            ? "var(--accent-amber)"
            : dropError
            ? "rgba(239,68,68,0.4)"
            : "rgba(0,0,0,0.08)",
          backgroundColor: hasFile
            ? "rgba(16,185,129,0.05)"
            : isDragActive
            ? "rgba(224,142,54,0.04)"
            : "rgba(255,255,255,0.4)",
          boxShadow: hasFile
            ? "0 4px 24px rgba(0,0,0,0.04)"
            : isDragActive
            ? "0 20px 40px rgba(224,142,54,0.08), 0 4px 12px rgba(0,0,0,0.02)"
            : "0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
        }}
        transition={{ type: "tween", ease: [0.77, 0, 0.175, 1], duration: 0.6 }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-amber)]/30 to-transparent"
          aria-hidden
        />
        <AnimatePresence mode="wait">{dropzoneContent}</AnimatePresence>
      </motion.div>

      {/* ── Drop error ── */}
      <AnimatePresence>
        {dropError && (
          <motion.div
            id="bar-drop-error"
            aria-live="polite"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.77, 0, 0.175, 1] }}
            className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 shadow-sm"
            style={{ fontFamily: "var(--font-sans-ui)" }}
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            {dropError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-8 flex w-full max-w-xl lg:max-w-4xl items-center gap-4 px-2">
        <span className="h-px flex-1 bg-[var(--accent-amber)]/30" />
        <span
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent-amber)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Or
        </span>
        <span className="h-px flex-1 bg-[var(--accent-amber)]/30" />
      </div>

      <AnimatePresence>
        {brewError && (
          <motion.div
            key="brew-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 shadow-sm"
            style={{ fontFamily: "var(--font-sans-ui)" }}
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            {brewError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-6"
      >
        {isBrewing ? (
          <div className="mb-6">
            <BrewingProgress progress={brewProgress} label="Brewing…" />
          </div>
        ) : hasFile && !showTipJar && availableBrews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800 shadow-sm"
            style={{ fontFamily: "var(--font-sans-ui)" }}
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            {"We don't have a conversion recipe for this file type yet. Drop a different ingredient."}
          </motion.div>
        ) : null}

        <BreweryMenu
          file={file}
          category={fileCategory}
          onSelectBrew={hasFile && !showTipJar && availableBrews.length ? handleBrewSelect : undefined}
          disabled={isBrewing}
        />
      </motion.div>
    </section>
  );
}
