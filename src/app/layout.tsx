import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Coffee, Chrome } from "lucide-react";
import { Logo } from "@/components/Logo";
import "./globals.css";

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

const siteUrl = "https://brewery.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Brewery - Brew your files",
    template: "%s | Brewery",
  },
  description:
    "Drop your ingredients on the bar. We brew them into new formats - right in your browser. No data ever leaves your device.",
  keywords: ["file converter", "convert files", "privacy", "browser", "client-side", "WASM"],
  authors: [{ name: "Brewery" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Brewery - Brew your files",
    description:
      "Drop your ingredients on the bar. We brew them into new formats - right in your browser. No data ever leaves your device.",
    siteName: "Brewery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brewery - Brew your files",
    description:
      "Drop your ingredients on the bar. We brew them into new formats - right in your browser.",
  },
  robots: "index, follow",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Brewery",
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
      className={`${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
          <div className="relative z-10 mx-auto min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8 flex flex-col items-center">
            <header className="mb-8 w-full flex flex-col sm:flex-row justify-between items-center sm:h-16 gap-4 sm:gap-0 mt-4 sm:mt-6">
              <div className="w-full sm:w-1/3 hidden sm:block"></div>
              <div className="w-full sm:w-1/3 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex rounded-2xl items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Brewery home"
                >
                  <Logo size="md" />
                </Link>
              </div>
              <div className="w-full sm:w-1/3 flex justify-center sm:justify-end items-center gap-4 px-4 sm:px-0">
                <a
                  href="https://ko-fi.com/damonphoenix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-colors flex items-center gap-1.5"
                >
                  <Coffee className="h-4 w-4" />
                  Tip the Brewer
                </a>
                <a
                  href="https://chromewebstore.google.com/detail/dia-browser-ai-chat-with/bdabofmhlffpepnnkfcdnpiikpcigkko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label="Add to Dia"
                >
                  <Chrome className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  Add to Dia
                </a>
              </div>
            </header>
            {children}
          </div>
      </body>
    </html>
  );
}
