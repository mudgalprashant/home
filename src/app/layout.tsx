import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
