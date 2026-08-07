import { Section, SectionPlaceholder } from "@/components/ui/section";
import { formatDateRange } from "@/lib/format";
import type { PublicExperience } from "@/lib/content";

export function ExperienceSection({ items }: { items: PublicExperience[] }) {
  return (
    <Section id="experience" title="Experience">
      {items.length === 0 ? (
        <SectionPlaceholder>
          A scannable timeline of roles, expandable for detail.
        </SectionPlaceholder>
      ) : (
        <ol className="space-y-8">
          {items.map((item) => (
            <li key={item.id}>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-medium text-foreground">
                  {item.role}
                  <span className="text-muted"> · {item.company}</span>
                </h3>
                <p className="shrink-0 font-mono text-xs text-muted">
                  {formatDateRange(item.start_date, item.end_date)}
                </p>
              </div>

              {item.summary ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
              ) : null}

              {item.highlights.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {item.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="relative pl-4 text-sm leading-relaxed text-muted before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-border"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
