import Link from "next/link";
import { SectionNav, type NavSection } from "@/components/layout/section-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { site } from "@/lib/site";

/**
 * Section anchors. Shared with the section shells rendered on the home page, so
 * a link here always has a target — see src/app/page.tsx.
 *
 * The admin route is deliberately absent, and must stay absent: no navigation,
 * footer, sitemap, or command-palette entry points to it (KB/plan.md §3a).
 */
export const navSections: readonly NavSection[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-6">
        <Link
          href="/"
          className="shrink-0 font-mono text-sm font-medium tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {site.name}
        </Link>

        {/* Scrolls horizontally rather than collapsing into a menu — five short
            links fit on a phone, and a hamburger would add JS and a focus trap
            for no benefit at this size. */}
        <SectionNav sections={navSections} />

        <ThemeToggle />
      </div>
    </header>
  );
}
