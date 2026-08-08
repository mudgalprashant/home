"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestMagicLink, type LoginState } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
    >
      {pending ? "Sending…" : "Email me a link"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    requestMagicLink,
    {},
  );

  if (state.sent) {
    return (
      <p className="rounded-md border border-border bg-surface px-3 py-3 text-sm text-muted">
        If that address has an account, a sign-in link is on its way. The link is
        single-use and expires shortly.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="email" className="block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          // Client validation is convenience only; the Server Action re-validates
          // with the same schema, because a direct POST never touches this form
          // (KB/security.md §4.2 rule 6).
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-foreground">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
