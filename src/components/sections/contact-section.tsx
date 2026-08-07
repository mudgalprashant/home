import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { Section } from "@/components/ui/section";
import type { PublicProfile } from "@/lib/content";

/**
 * Links only, for now — the contact form arrives with the form-provider wiring
 * in Phase 6 (KB/plan.md §6).
 *
 * The email address is deliberately not published here. It exists on the profile
 * record but is never selected for public pages (see the note in lib/content.ts),
 * so it cannot leak through the RSC payload. Reaching out will go through the
 * form instead, which keeps the address away from scrapers.
 */
const linkClass =
  "inline-flex items-center gap-2 rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ContactSection({ profile }: { profile: PublicProfile | null }) {
  // No GitHub/LinkedIn brand marks: lucide-react 1.x removed all brand icons,
  // and hand-embedding logo paths risks shipping a subtly wrong shape. The text
  // label carries the meaning; the arrow just marks the link as external.
  const external = [
    profile?.github_url && { href: profile.github_url, label: "GitHub" },
    profile?.linkedin_url && { href: profile.linkedin_url, label: "LinkedIn" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <Section id="contact" title="Contact">
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
        {external.map(({ href, label }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <ArrowUpRight className="size-4" aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}

        {/*
          Points at the /resume page rather than straight at the PDF: it opens in
          place, reads well on a phone, and offers the download from there.
          Rendered with next/link and no target="_blank" — it is same-origin, so
          it should navigate client-side rather than spawn a tab.
        */}
        <li>
          <Link href="/resume" className={linkClass}>
            <FileText className="size-4" aria-hidden="true" />
            Resume
          </Link>
        </li>
      </ul>
    </Section>
  );
}
