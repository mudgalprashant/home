import { Section, SectionPlaceholder } from "@/components/ui/section";
import type { PublicProfile } from "@/lib/content";

export function AboutSection({ profile }: { profile: PublicProfile | null }) {
  return (
    <Section id="about" title="About">
      {profile?.bio ? (
        // whitespace-pre-line so paragraph breaks typed into the admin textarea
        // survive to the page. The value is interpolated as text, never HTML, so
        // React escapes it (KB/security.md §3.2).
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
          {profile.bio}
        </p>
      ) : (
        <SectionPlaceholder>
          A short narrative bio: what kind of engineer this is, and the current
          focus. Loaded from the profile record.
        </SectionPlaceholder>
      )}
    </Section>
  );
}
