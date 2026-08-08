import { requireAdmin } from "@/lib/supabase/admin-guard";
import { SignOutButton } from "@/components/admin/sign-out-button";

// Always rendered per request. Caching a page whose entire purpose is to reflect
// the current session would be a correctness bug before it was a security one.
export const dynamic = "force-dynamic";

/**
 * Wraps every admin route **except login**, which is why it can guard
 * unconditionally. The route group `(protected)` keeps that separation without
 * changing any URL — the dashboard is still `/admin`.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization, re-checked on every render rather than once at login.
  // Middleware has already confirmed a verified session exists; this confirms it
  // belongs to the allow-listed admin.
  const admin = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Admin</h1>
          <p className="font-mono text-xs text-muted">{admin.email}</p>
        </div>
        <SignOutButton />
      </div>

      {children}
    </div>
  );
}
