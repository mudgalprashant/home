import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { readSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Server-side Supabase client, bound to the request's cookies.
 *
 * The `server-only` import makes it a build error to pull this into a Client
 * Component, so the session-reading path cannot accidentally end up in the
 * browser bundle.
 *
 * Sessions live in cookies rather than localStorage so that the auth token is
 * not readable from JavaScript (KB/security.md §3.1) -- `@supabase/ssr` handles
 * that, which is why this project uses it rather than the plain supabase-js
 * browser client for authenticated work.
 */
export async function createClient() {
  const { url, anonKey } = readSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. This is expected and safe to
          // ignore: session refresh is handled in middleware, which can write
          // them. Without this catch, every read from a Server Component would
          // throw the moment Supabase decided to rotate a token.
        }
      },
    },
  });
}
