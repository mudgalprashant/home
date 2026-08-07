import { site } from "@/lib/site";

/**
 * Phase 1 placeholder — a deliberately minimal, branded landing page that proves
 * the deploy pipeline, fonts, and theme tokens all work end to end.
 *
 * The real sections (hero, about, experience, projects, skills, contact) arrive in
 * Phase 2, rendered from database content rather than hardcoded here
 * (KB/plan.md §3, §6).
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Portfolio
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {site.name}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-muted">
          {site.description}
        </p>

        <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-accent"
          />
          <p className="font-mono text-sm text-muted">
            Site in active development — full content coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}
