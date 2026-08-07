"use client";

import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Browser Supabase client.
 *
 * Used only where the browser genuinely needs to talk to Supabase directly --
 * in practice, the admin login form in Phase 3. Public page content is fetched
 * server-side instead (see server.ts), which keeps it out of the client bundle
 * and lets pages be cached.
 *
 * This client carries the public anon key. Everything it can do, anyone with
 * Postman can also do, so its capabilities are bounded by RLS rather than by
 * what this file happens to call (KB/security.md §3.3).
 */
export function createClient() {
  const { url, anonKey } = readSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
