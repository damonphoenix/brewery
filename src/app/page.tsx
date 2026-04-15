import Link from "next/link";
import { BarCounter } from "@/components/BarCounter/BarCounter";
import { WasmPreloader } from "@/components/WasmPreloader";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      <WasmPreloader />
      <header className="flex flex-col items-center text-center">
        <p
          className="text-sm uppercase tracking-[0.2em] text-[var(--text-cream-muted)]"
          style={{ fontFamily: "var(--font-sans-ui)" }}
        >
          Est. 2026
        </p>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-[var(--text-cream-muted)]">
          Everything is brewed locally on your device. Straight from the tap - 100% in-house.
        </p>
        <div
          className="mt-8 h-px w-16 rounded-full bg-[var(--accent-amber)]/40"
          aria-hidden
        />
      </header>

      <div className="flex flex-1 flex-col pt-10">
        <BarCounter />
      </div>

      <footer className="mt-16 border-t border-[var(--border-subtle)] pt-8 text-center">
        <p className="text-sm text-[var(--text-cream-muted)]">
          Brewed locally · No data ever leaves your device
        </p>
        <nav
          className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
          aria-label="Footer links"
        >
          <Link
            href="/privacy"
            className="text-[var(--text-cream-muted)] underline decoration-[var(--border-subtle)] underline-offset-4 transition-colors hover:text-[var(--accent-amber)] hover:decoration-[var(--accent-amber)]/50"
          >
            Privacy Policy
          </Link>
          <span className="text-[var(--border-subtle)]" aria-hidden>·</span>
          <Link
            href="/terms"
            className="text-[var(--text-cream-muted)] underline decoration-[var(--border-subtle)] underline-offset-4 transition-colors hover:text-[var(--accent-amber)] hover:decoration-[var(--accent-amber)]/50"
          >
            Terms of Service
          </Link>
          <span className="text-[var(--border-subtle)]" aria-hidden>·</span>
          <a
            href="https://github.com/damonphoenix/Taverrn/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-cream-muted)] underline decoration-[var(--border-subtle)] underline-offset-4 transition-colors hover:text-[var(--accent-amber)] hover:decoration-[var(--accent-amber)]/50"
          >
            ew, bugs?
          </a>
        </nav>
      </footer>
    </main>
  );
}
