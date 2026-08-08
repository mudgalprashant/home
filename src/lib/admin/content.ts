import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

/**
 * Reads for the admin UI.
 *
 * Deliberately separate from `lib/content.ts`, which narrows every `select` to
 * the columns a public page renders and omits `contact_email` entirely. The
 * admin needs the whole record in order to edit it, so the two have genuinely
 * different requirements and should not share a query.
 *
 * Keeping them apart also means a future widening here can never accidentally
 * widen what the public site fetches.
 *
 * Uses the cookie-bound client, not the anonymous one: these run inside the
 * guarded admin routes, which are dynamic anyway, and the session is what RLS
 * will evaluate on the write that follows.
 */
export async function getProfileForAdmin(): Promise<ProfileRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[admin] failed to load profile:", error);
    return null;
  }

  return data;
}
