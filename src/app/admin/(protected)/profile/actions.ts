"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/schemas";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Every field the form submits. Listed explicitly rather than iterating
 * `formData.keys()`, so an unexpected extra field in the POST body is ignored
 * instead of being forwarded to the database — a Server Action accepts whatever
 * payload it is sent, not only what the form rendered (KB/security.md §3.3B).
 */
const FIELDS = [
  "name",
  "headline",
  "bio",
  "location",
  "contact_email",
  "github_url",
  "linkedin_url",
  "resume_url",
  "avatar_url",
] as const;

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Authorization first, before the payload is even looked at, and deliberately
  // outside any try/catch: requireAdmin() signals rejection by throwing a redirect,
  // and catching that would convert "sent to login" into "silently continued"
  // (the same class of bug as the swallowed dynamic-rendering bailout in
  // lib/content.ts — see KB/decision-log.md, 2026-08-08).
  await requireAdmin();

  const raw = Object.fromEntries(
    FIELDS.map((field) => [field, formData.get(field) ?? ""]),
  );

  // Server-side validation with the same schema the form uses. Not a duplicate
  // of the client check — the authoritative one. A direct POST never touches the
  // form (KB/security.md §4.2 rules 5-6).
  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors, error: "Please correct the highlighted fields." };
  }

  const supabase = await createClient();

  // The row id is read here rather than accepted from a hidden form field. A
  // client-supplied id is something the client can change, and trusting one is
  // how IDOR bugs start (KB/security.md §3.2) — even on a single-row table where
  // the blast radius is small today.
  const { data: existing } = await supabase
    .from("profile")
    .select("id")
    .limit(1)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("profile").update(parsed.data).eq("id", existing.id)
    : await supabase.from("profile").insert(parsed.data);

  if (error) {
    console.error("[admin] profile save failed:", error);
    // RLS rejects with 42501 when the session is authenticated but not the
    // allow-listed admin. Surfaced plainly: the database refusing a write is a
    // correct outcome, not an application error to paper over.
    return {
      error:
        error.code === "42501"
          ? "This account is not permitted to edit content."
          : "Could not save. Please try again.",
    };
  }

  // Push the change to the public site immediately rather than waiting out the
  // 1h ISR window (KB/system-design.md §3). Both routes render profile data.
  revalidatePath("/");
  revalidatePath("/resume");

  return { ok: true };
}
