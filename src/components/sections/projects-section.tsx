import { ArrowUpRight, Code } from "lucide-react";
import { Section, SectionPlaceholder } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag";
import type { PublicProject } from "@/lib/content";

/**
 * External links use rel="noopener noreferrer".
 *
 * noopener stops the opened page from reaching back through window.opener;
 * noreferrer additionally withholds the Referer header. Project URLs are
 * admin-authored, and the database CHECK constraints already restrict them to
 * http/https, so this is defence in depth rather than the primary control
 * (KB/security.md §3.2).
 */
function ProjectLink({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: string;
  icon: typeof ArrowUpRight;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </a>
  );
}

export function ProjectsSection({ items }: { items: PublicProject[] }) {
  return (
    <Section id="projects" title="Projects">
      {items.length === 0 ? (
        <SectionPlaceholder>
          Featured work — what was built, the stack behind it, and why it
          mattered, with links to live demos and source.
        </SectionPlaceholder>
      ) : (
        <ul className="space-y-8">
          {items.map((project) => (
            <li key={project.id}>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-foreground">{project.title}</h3>
                {project.featured ? (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                    Featured
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm leading-relaxed text-muted">{project.pitch}</p>

              {project.impact ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {project.impact}
                </p>
              ) : null}

              {project.stack.length > 0 ? (
                <div className="mt-3">
                  <TagList items={project.stack} />
                </div>
              ) : null}

              {project.demo_url || project.source_url ? (
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {project.demo_url ? (
                    <ProjectLink href={project.demo_url} icon={ArrowUpRight}>
                      Live demo
                    </ProjectLink>
                  ) : null}
                  {project.source_url ? (
                    <ProjectLink href={project.source_url} icon={Code}>
                      Source
                    </ProjectLink>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
