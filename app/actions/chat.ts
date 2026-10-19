"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/site";

export type ChatMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
  flagged: boolean;
};

// Historique d'une conversation (RLS Supabase : chaque utilisateur ne voit que les siennes).
export async function getMessages(modelId: string): Promise<ChatMessage[]> {
  const supabase = await supabaseServer();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("model_id", modelId)
    .maybeSingle();
  if (!conv) return [];

  const { data } = await supabase
    .from("messages")
    .select("id, role, content, created_at, flagged")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true })
    .limit(200);

  return (data ?? []) as ChatMessage[];
}

// Les modèles avec qui l'utilisateur a déjà une conversation (pour l'ordre/affichage "récents").
export async function getActiveModelIds(): Promise<string[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("conversations")
    .select("model_id")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  return (data ?? []).map((r) => r.model_id as string);
}

export type SendResult = { reply?: string; error?: string; flagged?: boolean };

// Appelle la fonction Edge "chat" (love20) avec le JWT de l'utilisateur courant.
// Garde-fous (mineur/détresse/contenu) et persistance des messages gérés côté fonction.
export async function sendMessage(modelId: string, message: string): Promise<SendResult> {
  const text = message.trim();
  if (!text) return { error: "empty" };

  const supabase = await supabaseServer();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { error: "auth" };

  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ model: modelId, message: text }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { error: j?.error || "server" };
    return { reply: j.reply, flagged: j.flagged };
  } catch {
    return { error: "network" };
  }
}
