import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Cookie-free Supabase client for reading public content.
 *
 * Deliberately separate from server.ts, and the distinction is load-bearing.
 *
 * server.ts binds to the request's cookies so it can see the admin's session.
 * Touching `cookies()` marks the route dynamic, which permanently opts it out of
 * static rendering and ISR — the caching that the whole performance story rests
 * on (KB/system-design.md §3). Using it for public reads silently traded away
 * every cached page for a session nobody needed.
 *
 * Public content needs no session: the anon key plus the public `select` RLS
 * policy is exactly the access level required. So this client reads with no
 * cookies at all, and pages that use it stay statically renderable.
 *
 * Rule of thumb: **public reads use this; anything involving a logged-in admin
 * uses server.ts.**
 */
export function createPublicClient() {
  const { url, anonKey } = readSupabaseEnv();

  return createSupabaseClient<Database>(url, anonKey, {
    auth: {
      // There is no session here by design, and nowhere to persist one on the
      // server. Turning these off avoids pointless refresh work.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
