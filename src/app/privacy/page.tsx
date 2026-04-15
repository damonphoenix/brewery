import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Taverrn handles your data. Local-first file conversion in your browser.",
};

export default function PrivacyPage() {
  return (
    <main className="pb-16">
      <p className="mb-8">
        <Link
          href="/"
          className="text-sm text-[var(--accent-amber)] underline-offset-4 hover:underline"
        >
          ← Back to Taverrn
        </Link>
      </p>
      <article className="mx-auto max-w-2xl space-y-8 text-[var(--text-cream-muted)]">
        <header className="space-y-2 border-b border-[var(--border-subtle)] pb-6">
          <h1
            className="text-3xl font-semibold text-[var(--text-cream)]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ fontFamily: "var(--font-sans-ui)" }}>
            Last updated: April 14, 2026
          </p>
        </header>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Summary</h2>
          <p>
            Taverrn is built around <strong className="text-[var(--text-cream)]">local processing</strong>.
            Your files are converted in your browser on your device. We do not receive, store, or process
            the contents of files you convert through the main bar experience.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Information on your device</h2>
          <p>
            To make the app convenient, Taverrn may keep a copy of the file you are working with in{" "}
            <strong className="text-[var(--text-cream)]">IndexedDB</strong> in your browser so you can
            return to it in the same browser. That data stays on your machine unless you clear site data
            or use another browser or device.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Optional sign-in</h2>
          <p>
            If you choose to sign in, an authentication provider may share basic profile information
            (such as your name and email) with us so we can identify your session. We use that only to
            operate the sign-in feature, not to access your converted files. Refer to your
            provider&apos;s privacy policy for how they handle your account data.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Logs and diagnostics</h2>
          <p>
            Like most websites, our hosting and infrastructure may collect standard technical information
            (for example IP address, browser type, and request metadata) for security and reliability.
            That information is not tied to the contents of files you process locally.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Cookies</h2>
          <p>
            We may use cookies or similar technologies required for authentication, preferences, or basic
            site operation. You can control cookies through your browser settings.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Third-party services</h2>
          <p>
            We may load fonts or other assets from third parties (for example Google Fonts) in order to
            display the site. Those providers may receive technical data typical of a web request. Review
            their policies if you need detail.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Children</h2>
          <p>
            Taverrn is not directed at children under 13, and we do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Changes</h2>
          <p>
            We may update this policy from time to time. The &quot;Last updated&quot; date at the top will
            change when we do. Continued use of the site after changes means you accept the revised policy.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-cream)]">Contact</h2>
          <p>
            For privacy questions, contact us using the official channels published for Taverrn (for
            example the contact or support information on{" "}
            <span className="text-[var(--text-cream)]">taverrn.app</span>).
          </p>
        </section>
      </article>
    </main>
  );
}
