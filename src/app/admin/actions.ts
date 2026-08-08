"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";

/**
 * Auth Server Actions.
 *
 * A Server Action is a public POST endpoint whose id is visible in the client
 * bundle — it can be invoked directly with any payload, by anyone who reads that
 * id (KB/security.md §3.3B). So every one of these validates its input and never
 * assumes the UI is what called it.
 */

const emailSchema = z.object({
  email: z.email("Enter a valid email address").max(320),
});

export type LoginState = { error?: string; sent?: boolean };

/**
 * Sends a magic link.
 *
 * Magic link rather than a password: there is no password to store, leak, reuse,
 * or brute-force, which removes an entire category of problem for a single-admin
 * site (KB/security.md §7.3).
 *
 * `shouldCreateUser: false` is load-bearing. Supabase's default is to create an
 * account for any address that asks for a link — which would let a stranger mint
 * a valid session. They would still fail the allow-list check and RLS, but a
 * self-service account factory on the login page is surface with no upside.
 */
export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${site.url}/auth/callback`,
    },
  });

  if (error) {
    console.error("[auth] magic link request failed:", error.message);
  }

  // Deliberately the same response whether or not that address exists. Differing
  // replies would turn this form into an oracle for which emails have accounts.
  // Supabase rate-limits the endpoint itself, so this is not a spam vector.
  return { sent: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
