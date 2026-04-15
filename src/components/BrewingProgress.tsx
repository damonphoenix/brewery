"use client";

import { motion } from "framer-motion";

export interface BrewingProgressProps {
  /** 0-100 or null for indeterminate */
  progress: number | null;
  label?: string;
  className?: string;
}

export function BrewingProgress({
  progress,
  label = "Brewing…",
  className = "",
}: BrewingProgressProps) {
  const isIndeterminate = progress === null;

  return (
    <div
      className={`rounded-xl border border-[var(--border-glow)] bg-[var(--bg-charred-muted)] p-6 shadow-[inset_0_0_24px_rgba(224,142,54,0.06)] ${className}`}
      role="status"
      aria-label={label}
      aria-valuenow={isIndeterminate ? undefined : progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={isIndeterminate ? "Brewing in progress" : `${progress}%`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Stein/barrel fill animation */}
        <div className="relative h-24 w-16 overflow-hidden rounded-b-lg border-2 border-[var(--accent-amber)]/40 bg-[var(--bg-charred)]">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-[var(--accent-amber)]"
            initial={{ height: "0%" }}
            animate={{
              height: isIndeterminate ? "60%" : `${progress}%`,
            }}
            transition={
              isIndeterminate
                ? {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.2,
                  }
                : { type: "spring", stiffness: 50, damping: 20 }
            }
          />
        </div>
        <p
          className="text-center font-medium text-[var(--text-cream)]"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          {label}
        </p>
        {!isIndeterminate && (
          <p className="text-sm text-[var(--text-cream-muted)]">{progress}%</p>
        )}
      </div>
    </div>
  );
}
