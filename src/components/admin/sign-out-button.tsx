import { signOut } from "@/app/admin/actions";

/**
 * A form rather than an onClick handler, so signing out is a POST. A GET that
 * mutates session state can be triggered by anything that fetches a URL —
 * a prefetcher, a link preview, an image tag on another site.
 */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Sign out
      </button>
    </form>
  );
}
