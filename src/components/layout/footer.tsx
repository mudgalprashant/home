import { site } from "@/lib/site";

/**
 * Social and contact links are intentionally absent for now. They belong to the
 * profile record and arrive with the rest of the database-backed content in
 * Phase 2 — hardcoding placeholder URLs here would be exactly the "content in
 * components" pattern the plan exists to avoid (KB/plan.md §8).
 */
export function Footer() {
  return (
    <footer className="border-t border-border print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-1 px-6 py-8">
        {/*
          No year here on purpose. This page is statically prerendered, so
          `new Date().getFullYear()` would be evaluated at build time and frozen
          into the HTML — the footer would read "© 2026" throughout 2027 until
          something happened to trigger a redeploy. Rendering it on the client
          instead would mean shipping JS and risking a hydration mismatch for a
          detail nobody reads. Omitting it is correct in every year.
        */}
        <p className="text-sm text-muted">© {site.name}</p>
        <p className="font-mono text-xs text-muted">
          Built with Next.js. Source on GitHub.
        </p>
      </div>
    </footer>
  );
}
