import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getModel } from "@/lib/models";
import { LiveStage } from "@/components/Live/LiveStage";
import { SITE_NAME } from "@/lib/site";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = getModel(id);
  return { title: `Live ${m?.name ?? ""} — ${SITE_NAME}` };
}

export default async function LiveSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <LiveStage model={model} />
    </main>
  );
}
