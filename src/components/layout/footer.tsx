import { site } from "@/lib/site";

/**
 * Social and contact links are intentionally absent for now. They belong to the
 * profile record and arrive with the rest of the database-backed content in
 * Phase 2 — hardcoding placeholder URLs here would be exactly the "content in
 * components" pattern the plan exists to avoid (KB/plan.md §8).
 */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-1 px-6 py-8">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="font-mono text-xs text-muted">
          Built with Next.js. Source on GitHub.
        </p>
      </div>
    </footer>
  );
}
