import { Section, SectionPlaceholder } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag";
import type { PublicSkill } from "@/lib/content";

export function SkillsSection({ items }: { items: PublicSkill[] }) {
  return (
    <Section id="skills" title="Skills">
      {items.length === 0 ? (
        <SectionPlaceholder>
          Grouped by category, chosen to signal depth over breadth.
        </SectionPlaceholder>
      ) : (
        <dl className="space-y-5">
          {items.map((group) => (
            <div key={group.id} className="sm:flex sm:gap-6">
              <dt className="w-32 shrink-0 font-mono text-xs uppercase tracking-wider text-muted">
                {group.category}
              </dt>
              <dd className="mt-2 sm:mt-0">
                <TagList items={group.items} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}
