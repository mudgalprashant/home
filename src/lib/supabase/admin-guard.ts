import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "./server";

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * Authorization check: is the current session the allow-listed admin?
 *
 * Middleware already established that *a* verified session exists. That is
 * authentication. This answers the different question — whether that particular
 * person is allowed to be here — and the two get conflated often enough that
 * KB/security.md §5.2 step 6 exists purely to test the gap.
 *
 * The verdict comes from `public.is_admin()` in the database, not from comparing
 * against an environment variable or anything the client supplied. That means
 * this check and the RLS policies consult the *same* allow-list table, so they
 * cannot disagree, and changing the admin address is a one-row update.
 *
 * Call at the top of every admin page and every Server Action that writes. It is
 * cheap, and the failure mode of forgetting it is severe.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();

  // getUser(), not getSession() — the latter returns whatever is in the cookie
  // without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error) {
    // Fail closed. An unreachable database or a renamed function must not read
    // as "allowed" — that is how a fail-open bug gets shipped.
    console.error("[admin-guard] is_admin() failed:", error);
    redirect("/admin/login");
  }

  if (!isAdmin) {
    // Authenticated but not authorized. Same destination as logged-out on
    // purpose: telling an unauthorized visitor that they signed in correctly
    // but lack permission confirms the account exists, which is more than they
    // need to know.
    redirect("/admin/login");
  }

  return { id: user.id, email: user.email };
}
