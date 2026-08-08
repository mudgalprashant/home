"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type FormState } from "@/app/admin/(protected)/profile/actions";
import { TextField, TextAreaField } from "./fields";
import type { ProfileRow } from "@/lib/supabase/types";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function ProfileForm({ profile }: { profile: ProfileRow | null }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateProfile,
    {},
  );
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="space-y-5">
      <TextField
        name="name"
        label="Name"
        required
        defaultValue={profile?.name}
        error={err("name")}
      />
      <TextField
        name="headline"
        label="Headline"
        required
        hint="One line under your name. The first thing a recruiter reads."
        defaultValue={profile?.headline}
        error={err("headline")}
      />
      <TextAreaField
        name="bio"
        label="Bio"
        required
        hint="Shown in the About section. Blank lines are preserved."
        defaultValue={profile?.bio}
        error={err("bio")}
      />
      <TextField
        name="location"
        label="Location"
        defaultValue={profile?.location}
        error={err("location")}
      />
      <TextField
        name="contact_email"
        label="Contact email"
        type="email"
        hint="Stored but never published — the public site never fetches this column."
        defaultValue={profile?.contact_email}
        error={err("contact_email")}
      />
      <TextField
        name="github_url"
        label="GitHub URL"
        defaultValue={profile?.github_url}
        error={err("github_url")}
      />
      <TextField
        name="linkedin_url"
        label="LinkedIn URL"
        defaultValue={profile?.linkedin_url}
        error={err("linkedin_url")}
      />
      <TextField
        name="resume_url"
        label="Resume URL"
        hint="An https:// link, or a path to a file in public/ such as /resume.pdf"
        defaultValue={profile?.resume_url}
        error={err("resume_url")}
      />
      <TextField
        name="avatar_url"
        label="Avatar URL"
        hint="Same rules as the resume link."
        defaultValue={profile?.avatar_url}
        error={err("avatar_url")}
      />

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SaveButton />
        {state.ok ? (
          <p role="status" className="text-sm text-muted">
            Saved. The public site is already updated.
          </p>
        ) : null}
        {state.error ? (
          <p role="alert" className="text-sm text-accent">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
