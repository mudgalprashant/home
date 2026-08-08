import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readSupabaseEnv } from "./env";

/**
 * Reads and refreshes the Supabase session inside middleware.
 *
 * **Uses `getUser()`, never `getSession()`.** This is the single most important
 * line in the file. `getSession()` decodes whatever is in the cookie and hands
 * it back without checking it — a forged or expired cookie sails straight
 * through. `getUser()` verifies the token against Supabase's auth server. In
 * middleware, which is the gate for the whole admin area, only the verified
 * answer is worth anything (KB/security.md §3.1).
 *
 * The cookie dance below looks redundant but is not: tokens get rotated during
 * `getUser()`, and the refreshed values have to be written onto a response
 * object that is then actually returned, or the browser never receives them and
 * the session dies on the next request.
 */
export async function getSessionUser(request: NextRequest) {
  const { url, anonKey } = readSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}
