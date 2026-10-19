import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getAllModels } from "@/lib/models";
import { GenerateForm } from "@/components/Generate/GenerateForm";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Générer — ${SITE_NAME}` };
export const instant = false;

export default async function GeneratePage() {
  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Générer une photo</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Décris la photo que tu veux, elle est générée à partir de ton forfait ou de tes crédits.
      </p>
      <div className="mt-6">
        <GenerateForm models={getAllModels()} />
      </div>
    </main>
  );
}
