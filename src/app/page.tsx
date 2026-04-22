import Link from "next/link";
import { BarCounter } from "@/components/BarCounter/BarCounter";
import { WasmPreloader } from "@/components/WasmPreloader";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-6rem)] flex-col items-center w-full px-4">
      <WasmPreloader />

      <header className="flex flex-col items-center text-center mt-12 mb-16 max-w-3xl">
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-[var(--text-primary)] leading-[1.1] pb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          File conversion,
          <br className="hidden sm:block" />
          <span className="font-medium text-[var(--accent-amber)]">straight from the tap.</span>
        </h1>
        <p
          className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed tracking-tight text-[var(--text-primary)]/70"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Everything is brewed 100% locally on your device.
          <br className="hidden sm:block" />
          <span className="text-[var(--accent-amber-dim)]">Absolutely no data leaves your browser.</span>
        </p>
      </header>

      <div className="w-full max-w-4xl flex flex-col pt-4 pb-10 z-10">
        <BarCounter />
      </div>

      <footer className="mt-auto pt-12 text-center z-10 w-full mb-8">
        <p
          className="mb-4 text-xs font-medium text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          © Damon Phoenix 2026. All rights reserved.
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium"
          aria-label="Footer links"
        >
          <Link
            href="/privacy"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-amber)]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-amber)]"
          >
            Terms
          </Link>
          <a
            href="https://github.com/damonphoenix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-amber)]"
          >
            GitHub
          </a>
          <a
            href="https://damonphoenix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-amber)]"
          >
            damonphoenix.com
          </a>
        </nav>
      </footer>
    </main>
  );
}
