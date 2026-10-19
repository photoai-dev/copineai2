import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { AuthForms } from "@/components/AuthForms";
import { ProfileGateForm } from "@/components/ProfileGateForm";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Mon compte — ${SITE_NAME}`,
};

// Page 100% dynamique par utilisateur (session/cookies) : jamais prérendue/cachée,
// contrairement aux pages publiques du reste du site (Cache Components activé globalement).
export const instant = false;

export default async function ComptePage() {
  const user = await getSessionUser();

  if (user) {
    const profile = await getProfileStatus();
    if (profile?.profileCompleted) redirect("/app/me/");
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <ProfileGateForm />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <AuthForms />
    </main>
  );
}
