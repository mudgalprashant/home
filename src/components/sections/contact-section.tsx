import { ArrowUpRight, FileText } from "lucide-react";
import { Section, SectionPlaceholder } from "@/components/ui/section";
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
export function ContactSection({ profile }: { profile: PublicProfile | null }) {
  // No GitHub/LinkedIn brand marks: lucide-react 1.x removed all brand icons,
  // and hand-embedding logo paths risks shipping a subtly wrong shape. The text
  // label carries the meaning; the arrow just marks the link as external.
  const links = [
    profile?.github_url && { href: profile.github_url, label: "GitHub", icon: ArrowUpRight },
    profile?.linkedin_url && { href: profile.linkedin_url, label: "LinkedIn", icon: ArrowUpRight },
    profile?.resume_url && { href: profile.resume_url, label: "Resume", icon: FileText },
  ].filter(Boolean) as { href: string; label: string; icon: typeof ArrowUpRight }[];

  return (
    <Section id="contact" title="Contact">
      {links.length === 0 ? (
        <SectionPlaceholder>
          A real contact form, plus links to GitHub, LinkedIn, and a resume
          download.
        </SectionPlaceholder>
      ) : (
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
