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
    <div className="flex flex-col gap-3">
      {/* Menu header */}
      <div className="px-2 pb-1 text-center">
        <h2
          className="text-lg font-medium tracking-wide text-[var(--text-primary)] sm:text-xl"
          
        >
          Select format
        </h2>
        <p
          className="mt-0.5 text-sm text-[var(--text-secondary)] font-medium"
        >
          Click a button below to begin brewing
        </p>
      </div>

      {/* Menu items - soft interactive pills */}
      <div className="flex flex-col gap-3" role="list" aria-label="Available brew formats">
        {brews.map((brew, index) => {
          const overLimit = isOverMediaLimit(fileSize, brew);
          const isDisabled = disabled || overLimit;
          return (
            <motion.button
              key={brew.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectBrew(brew.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              whileHover={!isDisabled ? { backgroundColor: 'var(--bg-elevated)' } : {}}
              whileTap={!isDisabled ? { scale: 1 } : {}}
              className="group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-xl px-5 py-4 transition-colors hover:border-[var(--accent-amber)]/40 hover:bg-[#fff7ed] hover:shadow-[0_8px_30px_rgba(224,142,54,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[var(--bg-surface)]"
              role="listitem"
              aria-label={`Brew to ${brew.label}: ${brew.description}`}
            >
              {/* Format Details */}
              <div className="flex flex-col items-start gap-1">
                <span
                  className="shrink-0 text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-amber)] transition-colors"
                  
                >
                  {brew.label}
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] text-left">
                  {brew.description}
                  {overLimit && (
                    <span className="ml-1 inline-block text-red-500">
                      (Over {MAX_MEDIA_SIZE_MB}MB)
                    </span>
                  )}
                </span>
              </div>
              
              {/* Brew Action */}
              <div className="flex shrink-0 items-center justify-center">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] transition-colors group-hover:bg-[var(--accent-amber)] group-hover:text-white">
                  <Beaker className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  if (nested) {
    return <div className="relative mt-8">{menuContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
      className="relative mt-8"
    >
      {menuContent}
    </motion.div>
  );
}
