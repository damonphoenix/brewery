import Link from "next/link";
import { BarCounter } from "@/components/BarCounter/BarCounter";
import { WasmPreloader } from "@/components/WasmPreloader";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-6rem)] flex-col items-center w-full px-4">
      <WasmPreloader />

      <section className="w-full max-w-6xl mt-12 mb-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start z-10">
        <header className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-3xl lg:max-w-none">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-[var(--text-primary)] leading-[1.1] pb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            File conversion,{" "}
            <br className="hidden sm:block" />
            <span className="font-medium text-[var(--accent-amber)]">straight from the tap.</span>
          </h1>
          <p
            className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed tracking-tight text-[var(--text-primary)]/70"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything is brewed 100% locally on your device.{" "}
            <br className="hidden sm:block" />
            Absolutely <span className="text-[var(--accent-amber-dim)]">no data</span> leaves your browser.
          </p>
        </header>

        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-xl lg:max-w-2xl">
            <BarCounter />
          </div>
        </div>
      </section>

      <footer className="mt-auto pt-12 text-center z-10 w-full mb-8">
        <div className="mx-auto w-full max-w-6xl flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p
            className="text-xs font-medium text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            © Phoenix Studios 2026. All rights reserved.
          </p>
          <nav
            className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2 text-sm font-medium"
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
        </div>
      </footer>
    </main>
  );
}
