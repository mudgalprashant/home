"use client";

import { useEffect, useRef, useState } from "react";

export type NavSection = { id: string; label: string };

/**
 * Section links with an indicator for whichever section is currently in view.
 *
 * Progressive enhancement: the links are plain anchors and work with no
 * JavaScript at all. Only the highlight depends on the observer, so a failure
 * here costs a visual cue, never navigation.
 *
 * IntersectionObserver rather than a scroll listener — the browser does the
 * work off the main thread, and there is no throttling to tune.
 */
export function SectionNav({ sections }: { sections: readonly NavSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Which sections are on screen right now. Kept in a ref because the observer
  // callback only reports entries that *changed*, so the full picture has to
  // persist across callbacks.
  const visible = useRef(new Set<string>());

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.current.add(entry.target.id);
          else visible.current.delete(entry.target.id);
        }

        // With several sections on screen, the topmost one is what the reader is
        // actually looking at. Ordering by the source list keeps that stable
        // without re-measuring positions on every callback.
        const current = sections.find((section) => visible.current.has(section.id));
        setActiveId(current?.id ?? null);
      },
      {
        // A band across the upper-middle of the viewport. Without it, a section
        // counts as "visible" the instant one pixel appears at the bottom of the
        // screen, and the highlight jumps ahead of what is being read.
        rootMargin: "-20% 0px -65% 0px",
      },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Sections"
      className="-mx-2 flex flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            // Communicates the highlight to assistive tech, which cannot see the
            // colour change. "location" is the correct token for "this is where
            // you are within the page".
            aria-current={isActive ? "location" : undefined}
            className={`shrink-0 rounded-md px-2 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
