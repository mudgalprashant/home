import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Gate for the admin area.
 *
 * This is the first of three independent checks (KB/security.md §7):
 *   1. here — is there a verified session at all?
 *   2. the admin layout — is that session's email on the allow-list?
 *   3. Postgres RLS — enforced on every write regardless of what the app did.
 *
 * Only the third is unbypassable, which is exactly why the other two exist:
 * an attacker skipping the UI still hits RLS, and a bug in RLS still has to get
 * past these.
 *
 * The matcher is scoped to `/admin/**` deliberately. Running middleware across
 * the whole site would put a per-request hop in front of pages that are
 * otherwise served straight from the edge cache — paying for the admin area's
 * security with the public site's speed, for no benefit.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Without Supabase configured there is no auth to enforce and no admin data to
  // protect. Fail closed anyway: send everything to login rather than exposing an
  // unguarded admin UI if the environment is ever misconfigured in production.
  if (!isSupabaseConfigured()) {
    if (pathname === "/admin/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { user, response } = await getSessionUser(request);

  // The login page has to stay reachable while logged out, or the redirect below
  // would point at itself. Session refresh still runs, so arriving here with a
  // valid session bounces onward rather than showing a pointless form.
  if (pathname === "/admin/login") {
    if (user) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    // No `?next=` parameter. It is the classic open-redirect vector, and with a
    // single admin and one destination it would buy nothing (KB/security.md §3.2).
    return NextResponse.redirect(loginUrl);
  }

  // A verified session is necessary but not sufficient — authorization (is this
  // user the allow-listed admin?) is checked in the admin layout, against the
  // database rather than against anything the client sent.
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
