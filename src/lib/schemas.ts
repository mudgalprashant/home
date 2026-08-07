import { z } from "zod";
import type { Database } from "./supabase/types";

/**
 * Validation schemas shared by the admin forms and the Server Actions behind
 * them. The client copy exists for fast feedback; the server copy is the one
 * that counts, and every Server Action must re-run it regardless of what the
 * form already checked (KB/security.md §4.2 rules 5-6).
 *
 * Rules here intentionally mirror the CHECK constraints in
 * supabase/migrations/0001_content_schema.sql. Duplicating them is deliberate:
 * the database constraint is the one that cannot be bypassed, and this copy
 * turns a would-be 400 from PostgREST into a readable field-level error. If you
 * change one, change both.
 */

/** Form inputs arrive as "" for untouched optional fields; store null instead. */
const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? null : value), schema.nullable());

/** Mirrors the `~* '^https?://'` CHECK constraints. For links off-site. */
const httpUrl = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .regex(/^https?:\/\//i, "Must start with http:// or https://");

/**
 * For assets that may be hosted either externally (Supabase Storage) or in this
 * repo under `public/` — the resume PDF and avatar image.
 *
 * Accepts an absolute http(s) URL, or a site-relative path like `/resume.pdf`.
 * The `(?!\/)` matters: it rejects protocol-relative URLs such as `//evil.com`,
 * which a browser resolves to an external origin despite looking like a local
 * path. `javascript:` and `data:` fail the pattern outright.
 *
 * Mirrors the CHECK constraints added in migration 0002.
 */
const assetUrl = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .regex(
    /^(https?:\/\/|\/(?!\/))/i,
    "Must be an http(s) URL or a site-relative path such as /resume.pdf",
  );

/** Mirrors the `projects_slug_format` CHECK constraint. */
const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80, "Slug is too long")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Lowercase letters, numbers, and single hyphens only",
  );

/** Single-line text: collapse newlines so they cannot break downstream output. */
const line = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max, `Must be ${max} characters or fewer`)
    .transform((value) => value.replace(/[\r\n]+/g, " "));

const optionalLine = (max: number) =>
  emptyToNull(z.string().trim().max(max).transform((v) => v.replace(/[\r\n]+/g, " ")));

const stringList = z.array(z.string().trim().min(1)).max(50);

// -----------------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------------
export const profileSchema = z.object({
  name: line(120),
  headline: line(200),
  bio: z.string().trim().min(1, "Required").max(2000),
  location: optionalLine(120),
  contact_email: emptyToNull(z.email("Must be a valid email address")),
  github_url: emptyToNull(httpUrl),
  linkedin_url: emptyToNull(httpUrl),
  resume_url: emptyToNull(assetUrl),
  avatar_url: emptyToNull(assetUrl),
});

// -----------------------------------------------------------------------------
// Experience
// -----------------------------------------------------------------------------
export const experienceSchema = z
  .object({
    role: line(120),
    company: line(120),
    start_date: z.iso.date(),
    end_date: emptyToNull(z.iso.date()),
    summary: emptyToNull(z.string().trim().max(1000)),
    highlights: stringList.default([]),
    sort_order: z.number().int().min(0).default(0),
  })
  // Mirrors the `experience_dates_ordered` CHECK constraint.
  .refine((v) => !v.end_date || v.end_date >= v.start_date, {
    message: "End date cannot be before the start date",
    path: ["end_date"],
  });

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------
export const projectSchema = z.object({
  slug,
  title: line(120),
  pitch: line(200),
  description: emptyToNull(z.string().trim().max(4000)),
  stack: stringList.default([]),
  demo_url: emptyToNull(httpUrl),
  source_url: emptyToNull(httpUrl),
  impact: optionalLine(300),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

// -----------------------------------------------------------------------------
// Skills
// -----------------------------------------------------------------------------
export const skillSchema = z.object({
  category: line(60),
  items: stringList.default([]),
  sort_order: z.number().int().min(0).default(0),
});

// -----------------------------------------------------------------------------
// Inferred input types
// -----------------------------------------------------------------------------
export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;

type Tables = Database["public"]["Tables"];

/**
 * Validated input → database insert payload.
 *
 * These look like identity functions, and at runtime they are. Their purpose is
 * the type annotation: each one fails to compile if a schema above drifts out of
 * shape with the table it writes to, so a mismatch between src/lib/schemas.ts
 * and the migration is caught at build time rather than as a PostgREST error in
 * production.
 */
export const toProfileInsert = (input: ProfileInput): Tables["profile"]["Insert"] => input;
export const toExperienceInsert = (input: ExperienceInput): Tables["experience"]["Insert"] => input;
export const toProjectInsert = (input: ProjectInput): Tables["projects"]["Insert"] => input;
export const toSkillInsert = (input: SkillInput): Tables["skills"]["Insert"] => input;
