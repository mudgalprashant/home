/**
 * Static site-level configuration.
 *
 * This is deliberately NOT where portfolio content lives. Name, bio, projects,
 * experience, and skills all come from the database so they stay editable from
 * the admin panel (KB/plan.md §2). Only values needed before a database query can
 * run — the canonical URL and metadata fallbacks — belong here.
 */
export const site = {
  /**
   * Canonical origin, used for absolute URLs in metadata, OG images, and the
   * sitemap. Falls back to localhost so a fresh clone works with no env file.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Fallback title used until profile data is wired up in Phase 2. */
  name: "Prashant Mudgal",

  /** Fallback description. Replaced by the database-backed headline in Phase 2. */
  description:
    "Senior Software Engineer. Portfolio, projects, and engineering writing.",
} as const;
