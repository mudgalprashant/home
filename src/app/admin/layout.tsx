import type { Metadata } from "next";

/**
 * Applies to everything under /admin, login included.
 *
 * This layout deliberately holds **no authorization check**. The guard lives in
 * `(protected)/layout.tsx` instead, so it wraps the dashboard but not the login
 * page. Putting it here would make login redirect to itself — which is exactly
 * what happened before this split, and the loop returned a 307 pointing at
 * `/admin/login` while still serving a page body, so it looked like it worked
 * until the status code was checked.
 *
 * The route group `(protected)` adds no URL segment, so the dashboard is still
 * served at `/admin`.
 */
export const metadata: Metadata = {
  title: "Admin",
  // Covers login too. Unlisted is a UX choice; this is what keeps the whole area
  // out of search results and social unfurls (KB/security.md §3.2).
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
