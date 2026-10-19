import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getActiveModelIds, getMessages } from "@/app/actions/chat";
import { getAllModels, getModel } from "@/lib/models";
import { ChatShell } from "@/components/Chat/ChatShell";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Messages — ${SITE_NAME}` };

// Page de session (chat) : jamais prérendue/cachée, comme /compte/.
export const instant = false;

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  const models = getAllModels();
  const { m } = await searchParams;
  const requested = m && getModel(m) ? m : null;
  const activeIds = await getActiveModelIds();
  const initialModelId = requested ?? activeIds[0] ?? models[0].id;
  const initialMessages = await getMessages(initialModelId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <ChatShell
        models={models}
        initialModelId={initialModelId}
        initialMessages={initialMessages}
      />
    </main>
  );
}
