import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getMessages } from "@/app/actions/chat";
import { getAllModels, getModel } from "@/lib/models";
import { ChatShell } from "@/components/Chat/ChatShell";
import { SITE_NAME } from "@/lib/site";

// CORRECTIF 2026-11-08 (Seb) : /app/me/ est bien notre nouvelle page de chat (ChatShell), mais
// ce n'est PAS par là que les abonnés y arrivent en pratique. Le vrai point d'entrée côté
// production est /{model}/chat/ (ex. /sophie/chat/) — lien natif de love20 lui-même (sa fiche
// modèle /vente/{id}/ a son propre onglet "Chat" qui pointe vers CETTE url, dans son propre
// HTML/JS, pas quelque chose qu'on contrôle depuis notre app). Avant cette page, /{model}/chat/
// ne correspondait à AUCUNE route Next.js (seule /[model]/ existe, sans sous-page /chat), donc
// la requête tombait tout droit dans le relais "fallback" générique vers love20 — d'où
// l'ancienne messagerie SPA encore visible en prod malgré le correctif sur /app/me/.
// Les routes dynamiques de l'app sont résolues AVANT le fallback (doc Next.js, ordre de
// routage : étape 7 avant étape 8), donc le simple fait que cette page existe suffit à
// intercepter /{model}/chat/ sans toucher next.config.ts. Même comportement que /app/me/page.tsx,
// seule différence : le modèle actif initial vient du segment d'URL plutôt que de ?m=.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model: id } = await params;
  const m = getModel(id);
  return { title: m ? `${m.name} — Messages — ${SITE_NAME}` : `Messages — ${SITE_NAME}` };
}

// Page de session (chat) : jamais prérendue/cachée, comme /app/me/ et /compte/.
export const instant = false;

export default async function ModelChatPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: modelId } = await params;
  if (!getModel(modelId)) notFound();

  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  const models = getAllModels();
  const initialMessages = await getMessages(modelId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <ChatShell models={models} initialModelId={modelId} initialMessages={initialMessages} />
    </main>
  );
}
