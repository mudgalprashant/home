import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing point. Exchanges the one-time code for a session and sets
 * the auth cookies.
 *
 * The redirect target is hardcoded to `/admin`. It would be conventional to
 * honour a `next` parameter here, but that is the textbook open-redirect: an
 * attacker sends `/auth/callback?next=https://evil.example`, the victim lands on
 * a lookalike having just authenticated, and the URL they checked was genuinely
 * this site's (KB/security.md §3.2). With one admin and one destination, the
 * parameter buys nothing.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Expired, already used, or forged. All three are indistinguishable to the
    // visitor on purpose — a specific message would tell an attacker which of
    // their guesses was closest.
    console.error("[auth] code exchange failed:", error.message);
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
