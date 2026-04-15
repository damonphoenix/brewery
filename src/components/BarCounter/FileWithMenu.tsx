"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, Image, Music, Video, Trash2 } from "lucide-react";
import type { FileCategory } from "@/lib/fileTypes";
import { CATEGORY_LABELS } from "@/lib/fileTypes";
import type { BrewId } from "@/lib/brews";
import { Card } from "@/components/ui/Card";
import { BrewList } from "@/components/BrewList";
import { BrewingProgress } from "@/components/BrewingProgress";

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

export interface FileWithMenuProps {
  file: File;
  category: FileCategory;
  isBrewing: boolean;
  brewProgress: number | null;
  onSelectBrew: (brewId: BrewId) => void;
  onClear: () => void;
}

export function FileWithMenu({
  file,
  category,
  isBrewing,
  brewProgress,
  onSelectBrew,
  onClear,
}: FileWithMenuProps) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = CATEGORY_ICONS[category];

  return (
    <Card variant="default" className="overflow-hidden p-0">
      {/* Header row: file info + dropdown toggle */}
      <div className="relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--accent-amber)]/[0.06] group">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-inset"
          aria-expanded={isOpen}
          aria-controls="file-menu-content"
          id="file-menu-trigger"
          aria-label={isOpen ? "Collapse menu" : "Expand menu"}
        />
        <div
          className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-amber)]/15 text-[var(--accent-amber)] pointer-events-none"
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
          <p className="truncate text-sm font-medium text-[var(--text-cream)]" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-[var(--text-cream-muted)]">
            {formatBytes(file.size)} · {CATEGORY_LABELS[category]}
          </p>
        </div>
        {!isBrewing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-cream-muted)] transition-colors hover:bg-[var(--bg-charred-muted)] hover:text-[var(--accent-amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)]"
            aria-label="Remove ingredient"
            title="Remove ingredient"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 shrink-0 text-[var(--text-cream-muted)] pointer-events-none"
          aria-hidden
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </div>

      {/* Dropdown: menu or brewing progress */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="file-menu-content"
            role="region"
            aria-labelledby="file-menu-trigger"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[var(--border-subtle)]"
          >
            {isBrewing ? (
              <div className="p-4">
                <BrewingProgress progress={brewProgress} label="Brewing…" />
              </div>
            ) : (
              <BrewList
                file={file}
                fileSize={file.size}
                category={category}
                onSelectBrew={onSelectBrew}
                disabled={false}
                nested
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
