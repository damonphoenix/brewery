"use client";

import { motion } from "framer-motion";
import { Beaker } from "lucide-react";
import type { FileCategory } from "@/lib/fileTypes";
import {
  getBrewsForFile,
  isOverMediaLimit,
  MAX_MEDIA_SIZE_MB,
  type BrewId,
} from "@/lib/brews";
import { Card } from "@/components/ui/Card";

export interface BrewListProps {
  file: File;
  fileSize: number;
  category: FileCategory;
  onSelectBrew: (brewId: BrewId) => void;
  disabled?: boolean;
  /** When true, render without outer Card (for nested inside file dropdown) */
  nested?: boolean;
}

export function BrewList({
  file,
  fileSize,
  category,
  onSelectBrew,
  disabled = false,
  nested = false,
}: BrewListProps) {
  const brews = getBrewsForFile(file, category);

  if (!brews.length) return null;

  const menuContent = (
    <>
      {/* Menu header - like a sign */}
      <div className="relative border-b border-[var(--accent-amber)]/20 bg-[var(--bg-charred)]/60 px-4 py-4 text-center sm:px-6 sm:py-4">
        <h2
          className="text-lg font-medium tracking-wide text-[var(--text-cream)] sm:text-xl"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          House Brews
        </h2>
        <p
          className="mt-0.5 text-sm text-[var(--text-cream-muted)]"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Choose your format
        </p>
        <div
          className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--accent-amber)]/25 to-transparent sm:left-6 sm:right-6"
          aria-hidden
        />
      </div>

      {/* Menu items - classic tavern list with dotted leaders */}
      <div className="px-4 py-3 sm:px-6 sm:py-4" role="list" aria-label="Available brew formats">
        {brews.map((brew, index) => {
          const overLimit = isOverMediaLimit(fileSize, brew);
          const isDisabled = disabled || overLimit;
          return (
            <motion.button
              key={brew.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectBrew(brew.id)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative flex w-full cursor-pointer items-center gap-3 border-b border-[var(--border-subtle)] py-4 text-left transition-colors last:border-b-0 last:pb-0 first:pt-0 hover:bg-[var(--accent-amber)]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent sm:gap-4 sm:px-1 sm:-mx-1 sm:rounded"
              role="listitem"
              aria-label={`Brew to ${brew.label}: ${brew.description}`}
            >
              {/* Format name */}
              <span
                className="shrink-0 text-base font-medium text-[var(--text-cream)] sm:text-lg"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                {brew.label}
              </span>
              {/* Dotted leader line */}
              <span
                className="min-h-0 flex-1 self-center border-b border-dotted border-[var(--text-cream-muted)]/25"
                aria-hidden
              />
              {/* Notes (desktop) + Brew label */}
              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                <span className="hidden max-w-[11rem] text-sm text-[var(--text-cream-muted)] sm:block">
                  {brew.description}
                  {overLimit && (
                    <span className="mt-0.5 block text-[var(--accent-amber)]/90">
                      Over {MAX_MEDIA_SIZE_MB}MB
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10 px-4 py-2 text-sm font-medium text-[var(--accent-amber)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group-hover:bg-[var(--accent-amber)]/20 group-hover:border-[var(--accent-amber)]/50">
                  <Beaker className="h-4 w-4" aria-hidden />
                  Brew
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );

  if (nested) {
    return <div className="relative">{menuContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative"
    >
      <Card
        variant="glow"
        className="overflow-hidden border-2 border-[var(--accent-amber)]/20 shadow-[inset_0_0_0_1px_rgba(224,142,54,0.08),0_4px_24px_rgba(0,0,0,0.3)]"
      >
        {menuContent}
      </Card>
    </motion.div>
  );
}
