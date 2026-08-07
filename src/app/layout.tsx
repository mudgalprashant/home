import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time by next/font — no runtime request to Google, and no
// layout shift from a late-arriving font file.
const sans = Geist({
  variable: "--font-sans-variable",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono-variable",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Lets every route express its OG/canonical URLs as relative paths.
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // Full Open Graph, Twitter Card, and JSON-LD wiring lands in Phase 5, once the
  // content it should describe actually exists (KB/plan.md §6).
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The theme script sets data-theme before React hydrates, so the server
      // and client markup differ on <html> by design.
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Must be the first element in <body> and must stay a plain, un-decorated
          <script src>: a classic synchronous script blocks parsing where it sits,
          so placing it here means it runs before any visible markup is parsed —
          which is the entire point (no flash of the wrong theme).

          next/script's beforeInteractive strategy was tried first and does NOT
          work for this. In the App Router it emits only a preload hint plus a
          queued push that Next executes during hydration, which is far too late:
          the page has already painted in the system theme by then. Verified by
          inspecting the served HTML.

          Do not add async/defer, and do not convert this to next/script.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
        >
          Skip to content
        </a>

        <Header />
        <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
