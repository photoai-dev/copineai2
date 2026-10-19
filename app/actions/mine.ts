"use server";
import { supabaseServer } from "@/lib/supabase/server";

export type MyConversation = {
  modelId: string;
  lastMessageAt: string | null;
  lastMessage: string | null;
};

// "Mes copines" : les modèles avec qui le membre a déjà une conversation, triés
// par dernier message. S'appuie sur les mêmes tables/RLS que le chat (Tâche #103).
export async function getMyConversations(): Promise<MyConversation[]> {
  const supabase = await supabaseServer();
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, model_id, last_message_at")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (!convs?.length) return [];

  const lastByConv = await Promise.all(
    convs.map(async (c) => {
      const { data: msg } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        modelId: c.model_id as string,
        lastMessageAt: c.last_message_at as string | null,
        lastMessage: msg?.content ?? null,
      };
    })
  );
  return lastByConv;
}
