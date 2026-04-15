"use client";

import { FileText, Image, Music, Video } from "lucide-react";
import type { FileCategory } from "@/lib/fileTypes";
import { CATEGORY_LABELS } from "@/lib/fileTypes";
import { Card } from "@/components/ui/Card";

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

export interface FileSummaryProps {
  name: string;
  size: number;
  category: FileCategory;
}

export function FileSummary({ name, size, category }: FileSummaryProps) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <Card variant="default" className="overflow-hidden px-0 py-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-amber)]/15 text-[var(--accent-amber)]"
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-cream)]" title={name}>
            {name}
          </p>
          <p className="text-xs text-[var(--text-cream-muted)]">
            {formatBytes(size)} · {CATEGORY_LABELS[category]}
          </p>
        </div>
      </div>
    </Card>
  );
}
