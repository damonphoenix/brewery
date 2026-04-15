import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Logo } from "@/components/Logo";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://taverrn.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Taverrn - Brew your files",
    template: "%s | Taverrn",
  },
  description:
    "Drop your ingredients on the bar. We brew them into new formats - right in your browser. No data ever leaves your device.",
  keywords: ["file converter", "convert files", "privacy", "browser", "client-side", "WASM"],
  authors: [{ name: "Taverrn" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Taverrn - Brew your files",
    description:
      "Drop your ingredients on the bar. We brew them into new formats - right in your browser. No data ever leaves your device.",
    siteName: "Taverrn",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taverrn - Brew your files",
    description:
      "Drop your ingredients on the bar. We brew them into new formats - right in your browser.",
  },
  robots: "index, follow",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14100e",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Taverrn",
  description:
    "Client-side file conversion. Drop your ingredients on the bar; we brew them into new formats in your browser. No data ever leaves your device.",
  url: siteUrl,
  applicationCategory: "UtilitiesApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
          <div className="relative z-10 mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <header className="mb-6 sm:mb-8">
              <Link
                href="/"
                className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-charred)]"
                aria-label="Taverrn home"
              >
                <Logo size="sm" />
              </Link>
            </header>
            {children}
          </div>
      </body>
    </html>
  );
}
