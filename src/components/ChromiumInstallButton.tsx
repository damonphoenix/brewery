"use client";

import { useEffect, useMemo, useState } from "react";
import { Chrome } from "lucide-react";
import { siArc, siBrave, siGooglechrome, siOpera, siVivaldi } from "simple-icons";

type ChromiumBrowser =
  | "Dia"
  | "Chrome"
  | "Brave"
  | "Edge"
  | "Opera"
  | "Vivaldi"
  | "Arc"
  | "Chromium"
  | "Chrome Web Store";

type SimpleIcon = { title: string; hex: string; path: string };

function detectChromiumBrowser(): ChromiumBrowser {
  if (typeof window === "undefined") return "Chrome Web Store";
  const w = window as unknown as { brave?: unknown };
  const ua = navigator.userAgent ?? "";

  if (ua.includes("Dia/") || ua.includes("Dia ")) return "Dia";
  if (w.brave) return "Brave";
  if (ua.includes("Edg/") || ua.includes("EdgA/") || ua.includes("EdgiOS")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Vivaldi")) return "Vivaldi";
  if (ua.includes("Arc/")) return "Arc";
  if (ua.includes("Chromium")) return "Chromium";
  if (ua.includes("Chrome/")) return "Chrome";
  return "Chrome Web Store";
}

function BrandMark({ browser }: { browser: ChromiumBrowser }) {
  const icon: SimpleIcon | null =
    browser === "Chrome" ? (siGooglechrome as SimpleIcon)
      : browser === "Brave" ? (siBrave as SimpleIcon)
        : browser === "Opera" ? (siOpera as SimpleIcon)
          : browser === "Vivaldi" ? (siVivaldi as SimpleIcon)
            : browser === "Arc" ? (siArc as SimpleIcon)
              : null;

  if (browser === "Dia") {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] bg-[var(--accent-amber)]/15 text-[10px] font-extrabold leading-none text-[var(--accent-amber)] ring-1 ring-[var(--accent-amber)]/25"
        aria-hidden
      >
        D
      </span>
    );
  }

  if (browser === "Edge") {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-amber)]/15 text-[10px] font-extrabold leading-none text-[var(--accent-amber)] ring-1 ring-[var(--accent-amber)]/25"
        aria-hidden
      >
        e
      </span>
    );
  }

  if (icon) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden
        className="shrink-0"
        style={{ color: `#${icon.hex}` }}
      >
        <path d={icon.path} fill="currentColor" />
      </svg>
    );
  }

  return (
    <Chrome className="h-4 w-4 text-[var(--accent-amber-dim)] group-hover:text-[var(--accent-amber)] transition-colors" />
  );
}

export function ChromiumInstallButton({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const [browser, setBrowser] = useState<ChromiumBrowser>("Chrome Web Store");

  useEffect(() => {
    setBrowser(detectChromiumBrowser());
  }, []);

  const label = useMemo(() => {
    if (browser === "Chrome Web Store") return "View in Chrome Web Store";
    return `Add to ${browser}`;
  }, [browser]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label}
      title={label}
    >
      <BrandMark browser={browser} />
      {label}
    </a>
  );
}

