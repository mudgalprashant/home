import type { ReactNode } from "react";

type SectionProps = {
  /** Anchor target; must match an entry in navSections. */
  id: string;
  title: string;
  children?: ReactNode;
};

/**
 * A page section with a heading and an anchor.
 *
 * scroll-mt-14 offsets the scroll position by the sticky header's height, so a
 * jump from the nav does not land with the heading hidden underneath it.
 */
export function Section({ id, title, children }: SectionProps) {
  return (
    // `reveal` is the scroll-driven fade defined in globals.css. It is purely
    // decorative and degrades to no animation at all, so it never gates content.
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="reveal scroll-mt-14 py-14"
    >
      <h2
        id={`${id}-heading`}
        className="font-mono text-xs uppercase tracking-[0.2em] text-muted"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Stand-in for a section whose real content arrives in Phase 2, when it will be
 * rendered from the database.
 */
export function SectionPlaceholder({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>;
}
