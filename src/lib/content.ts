import "server-only";

import { createPublicClient } from "./supabase/public";
import { isSupabaseConfigured } from "./supabase/env";
import type {
  ExperienceRow,
  ProfileRow,
  ProjectRow,
  SkillRow,
} from "./supabase/types";

/**
 * Read-side data access for public pages.
 *
 * Three rules hold across every function here:
 *
 * 1. **Select named columns, never `*`.** Over-fetching is a silent data leak
 *    (KB/security.md §3.1). `profile.contact_email` is deliberately absent below
 *    — the contact form handles reaching out, so publishing the address would
 *    only feed scrapers.
 *
 *    A nuance worth knowing, since it was measured rather than assumed: props
 *    passed to *Server* Components are not serialized into the RSC payload, only
 *    their rendered output is. Feeding an over-fetched field to a Server
 *    Component therefore does not leak it today. That protection disappears the
 *    moment a section becomes a Client Component, because its props *are*
 *    serialized into the HTML. Narrowing the select is the defence that holds
 *    either way, which is why it is the rule rather than "keep sections on the
 *    server".
 *
 * 2. **Degrade, never throw.** A missing Supabase project or a transient query
 *    error returns empty data and lets the page render its placeholder state.
 *    A portfolio that renders without its database is far better than one that
 *    500s, and it keeps CI able to build without credentials.
 *
 * 3. **Failures are logged, not swallowed.** Silent empty states are how a
 *    broken query survives to production looking like "no content yet".
 *
 * Reads go through the cookie-free client in supabase/public.ts, never the
 * session-bound one in supabase/server.ts. See that file for why — it is the
 * difference between these pages being cacheable and not.
 */

/**
 * Next signals control flow (dynamic-rendering bailouts, notFound, redirect) by
 * throwing errors carrying a `digest`. Catching those changes program behaviour
 * rather than handling a failure, so they are re-thrown.
 *
 * This is not hypothetical. Before reads were moved to the cookie-free client,
 * the catch below swallowed Next's "route couldn't be rendered statically
 * because it used cookies" bailout, and the page prerendered permanently empty
 * instead of surfacing the problem.
 */
function rethrowIfFrameworkError(error: unknown): void {
  if (typeof error === "object" && error !== null && "digest" in error) {
    throw error;
  }
}

/** Public subset of the profile. Note the absence of contact_email. */
export type PublicProfile = Pick<
  ProfileRow,
  "name" | "headline" | "bio" | "location" | "github_url" | "linkedin_url" | "resume_url" | "avatar_url"
>;

export type PublicExperience = Pick<
  ExperienceRow,
  "id" | "role" | "company" | "start_date" | "end_date" | "summary" | "highlights"
>;

export type PublicProject = Pick<
  ProjectRow,
  "id" | "slug" | "title" | "pitch" | "stack" | "demo_url" | "source_url" | "impact" | "featured"
>;

export type PublicSkill = Pick<SkillRow, "id" | "category" | "items">;

function reportFailure(what: string, error: unknown) {
  console.error(`[content] failed to load ${what}:`, error);
}

export async function getProfile(): Promise<PublicProfile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("profile")
      .select("name, headline, bio, location, github_url, linkedin_url, resume_url, avatar_url")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    rethrowIfFrameworkError(error);
    reportFailure("profile", error);
    return null;
  }
}

export async function getExperience(): Promise<PublicExperience[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("experience")
      .select("id, role, company, start_date, end_date, summary, highlights")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    rethrowIfFrameworkError(error);
    reportFailure("experience", error);
    return [];
  }
}

export async function getProjects(): Promise<PublicProject[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, slug, title, pitch, stack, demo_url, source_url, impact, featured")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    rethrowIfFrameworkError(error);
    reportFailure("projects", error);
    return [];
  }
}

export async function getSkills(): Promise<PublicSkill[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("skills")
      .select("id, category, items")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    rethrowIfFrameworkError(error);
    reportFailure("skills", error);
    return [];
  }
}
