import { Section, SectionPlaceholder } from "@/components/ui/section";
import { site } from "@/lib/site";

/**
 * Home page.
 *
 * The hero and section shells are in place; their content arrives in Phase 2,
 * read from the database rather than written here (KB/plan.md §3, §6). Section
 * ids match navSections in the header, so every nav link has a target.
 */
export default function Home() {
  return (
    <>
      <section className="py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Portfolio
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {site.name}
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          {site.description}
        </p>

        <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          <p className="font-mono text-sm text-muted">
            Site in active development — full content coming soon.
          </p>
        </div>
      </section>

      <Section id="about" title="About">
        <SectionPlaceholder>
          A short narrative bio: what kind of engineer this is, and the current
          focus. Loaded from the profile record.
        </SectionPlaceholder>
      </Section>

      <Section id="experience" title="Experience">
        <SectionPlaceholder>
          A scannable timeline of roles, expandable for detail.
        </SectionPlaceholder>
      </Section>

      <Section id="projects" title="Projects">
        <SectionPlaceholder>
          Featured work — what was built, the stack behind it, and why it
          mattered, with links to live demos and source.
        </SectionPlaceholder>
      </Section>

      <Section id="skills" title="Skills">
        <SectionPlaceholder>
          Grouped by category, chosen to signal depth over breadth.
        </SectionPlaceholder>
      </Section>

      <Section id="contact" title="Contact">
        <SectionPlaceholder>
          A real contact form, plus links to GitHub, LinkedIn, and a resume
          download.
        </SectionPlaceholder>
      </Section>
    </>
  );
}
