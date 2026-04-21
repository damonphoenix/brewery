import Link from "next/link";
import { BarCounter } from "@/components/BarCounter/BarCounter";
import { WasmPreloader } from "@/components/WasmPreloader";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-6rem)] flex-col items-center w-full px-4">
      <WasmPreloader />
      
      <header className="flex flex-col items-center text-center mt-12 mb-16 max-w-3xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-amber)] mb-6"
          style={{ fontFamily: "var(--font-sans-ui)" }}
        >
          Est. 2026
        </p>
        <h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-[#111111] leading-[1.1] pb-2" 
          style={{ fontFamily: "var(--font-sans-ui)" }}
        >
          File conversion,
          <br className="hidden sm:block" />
          <span className="text-[var(--text-secondary)] font-medium">straight from the tap.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed text-[var(--text-secondary)] font-normal tracking-tight">
          Everything is brewed locally on your device. Absolutely no data leaves your browser.
        </p>
      </header>

      <div className="w-full max-w-4xl flex flex-col pt-4 pb-12 z-10">
        <BarCounter />
      </div>

      <footer className="mt-auto pt-12 text-center z-10 w-full mb-8">
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
            href="https://github.com/damonphoenix/Brewery/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-amber)]"
          >
            Bugs?
          </a>
        </nav>
      </footer>
    </main>
  );
}
