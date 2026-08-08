import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Login sits outside the `(protected)` route group on purpose. That group's
 * layout calls requireAdmin(), which redirects here — so rendering this form
 * inside it produced a 307 loop pointing at itself.
 */
export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-20">
      <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
      <p className="mt-1 text-sm text-muted">
        A sign-in link will be emailed to the account on file.
      </p>

      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
