import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProfileForAdmin } from "@/lib/admin/content";
import { ProfileForm } from "@/components/admin/profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getProfileForAdmin();

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to admin
      </Link>

      <h2 className="text-base font-medium text-foreground">Profile</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Feeds the hero, About section, and resume page.
      </p>

      <ProfileForm profile={profile} />
    </div>
  );
}
