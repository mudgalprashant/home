/**
 * Supabase environment access.
 *
 * Read lazily inside a function rather than validated at module scope on
 * purpose: CI builds the app without Supabase credentials, and a module-level
 * throw would fail the build for every PR before any query even exists. Reading
 * at client-construction time means the failure happens where it is actionable,
 * with a message that says what to do.
 *
 * Both variables are NEXT_PUBLIC_ and ship in the browser bundle. That is by
 * design, not an oversight: the anon key is meant to be public, and Row Level
 * Security -- not key secrecy -- is what prevents unauthorized writes
 * (KB/security.md §1).
 */
export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function readSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment ${missing.length > 1 ? "variables" : "variable"}: ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in the values from your Supabase project ` +
        `(Project Settings → API). See supabase/README.md.`,
    );
  }

  return { url: url!, anonKey: anonKey! };
}

/**
 * Whether Supabase is configured at all. Lets callers degrade gracefully during
 * the phase where the schema exists but no project has been provisioned yet,
 * instead of crashing a page render.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
