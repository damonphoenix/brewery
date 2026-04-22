import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of Brewery’s local file conversion tools.",
};

export default function TermsPage() {
  return (
    <main className="pb-16">
      <p className="mb-8">
        <Link
          href="/"
          className="text-sm text-[var(--accent-amber)] underline-offset-4 hover:underline"
        >
          ← Back to Brewery
        </Link>
      </p>
      <article className="mx-auto max-w-2xl space-y-8 text-[var(--text-secondary)]">
        <header className="space-y-2 border-b border-[var(--border-subtle)] pb-6">
          <h1
            className="text-3xl font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-sm" style={{ fontFamily: "var(--font-sans-ui)" }}>
            Last updated: April 14, 2026
          </p>
        </header>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Agreement</h2>
          <p>
            By accessing or using Brewery (&quot;the Service&quot;), you agree to these Terms. If you do
            not agree, do not use the Service.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">What Brewery does</h2>
          <p>
            Brewery provides browser-based tools to convert and transform files on{" "}
            <strong className="text-[var(--text-primary)]">your device</strong>. Features, supported formats,
            and limits may change. The Service is offered for general personal and business convenience,
            not for safety-critical or regulated uses unless you independently verify suitability.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Your responsibilities</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You are responsible for the files you process and for complying with applicable laws,
              including copyright and export rules.
            </li>
            <li>
              You keep backups of important data. Conversion can fail or produce unexpected results for
              damaged, unusual, or very large files.
            </li>
            <li>
              You use the Service at your own risk. Do not rely on it as the only copy of valuable
              material.
            </li>
          </ul>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Accounts</h2>
          <p>
            If we offer sign-in, you are responsible for your account credentials and for activity under
            your account. Notify us through published support channels if you suspect unauthorized use.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Acceptable use</h2>
          <p>
            You may not misuse the Service, including attempting to disrupt it, access others&apos; data
            without permission, or use it to distribute malware or unlawful content.
          </p>
          <p>
            You may not use the Service to create, convert, store, distribute, or facilitate access to
            any child sexual abuse material (CSAM) or any content that sexually exploits or endangers
            minors. We may take immediate action including removing access, terminating accounts, and
            preserving and reporting information to the National Center for Missing &amp; Exploited
            Children (NCMEC) and/or law enforcement, as required or permitted by law. We will cooperate
            with investigations and pursue enforcement to the fullest extent of the law.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Disclaimer of warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF
            ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Limitation of liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, BREWERY AND ITS OPERATORS WILL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR ANY LOSS OF PROFITS,
            DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE WILL
            NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE
            THE CLAIM OR (B) FIFTY U.S. DOLLARS (US$50), IF YOU PAID NOTHING THEN FIFTY U.S. DOLLARS (US$50).
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Intellectual property</h2>
          <p>
            The Service, including its branding, design, and software, is owned by Phoenix Studios or its
            licensors. These Terms do not grant you any rights to our trademarks or code except the
            limited right to use the Service as offered.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Termination</h2>
          <p>
            We may suspend or discontinue the Service or restrict access at any time. You may stop using
            the Service at any time.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Governing law</h2>
          <p>
            These Terms are governed by the laws applicable to the operator of Brewery, without regard to
            conflict-of-law rules. Courts in that jurisdiction have exclusive venue, subject to mandatory
            consumer protections where you live.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Changes</h2>
          <p>
            We may update these Terms. We will post the new date at the top. If changes are material, we
            may provide additional notice where practical. Continued use after changes constitutes
            acceptance.
          </p>
        </section>

        <section className="space-y-3" style={{ fontFamily: "var(--font-sans-ui)" }}>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Contact</h2>
          <p>
            For questions about these Terms, use the official contact or support information published for
            Brewery.
          </p>
        </section>
      </article>
    </main>
  );
}
