"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/site";

export type ChatMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
  flagged: boolean;
  media_id?: string | null;
  media_url?: string | null;
  media_kind?: "photo" | "video" | null;
};

// Résout les URLs (signées pour le privé) d'une liste d'ids média, via la fonction Edge
// "media-url" — même logique de droits que la galerie (public/privé/bloqué selon forfait).
async function resolveMediaUrls(
  token: string,
  ids: string[]
): Promise<Record<string, { url: string | null; kind: string }>> {
  if (!ids.length) return {};
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/media-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids }),
    });
    const j = await r.json().catch(() => ({}));
    const out: Record<string, { url: string | null; kind: string }> = {};
    for (const id of ids) out[id] = { url: j?.urls?.[id] ?? null, kind: j?.kinds?.[id] ?? "photo" };
    return out;
  } catch {
    return {};
  }
}

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
    .select("id, role, content, created_at, flagged, media_id")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true })
    .limit(200);

  const rows = (data ?? []) as ChatMessage[];
  const ids = [...new Set(rows.filter((r) => r.media_id).map((r) => r.media_id as string))];
  if (ids.length) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const resolved = token ? await resolveMediaUrls(token, ids) : {};
    for (const r of rows) {
      if (r.media_id && resolved[r.media_id]) {
        r.media_url = resolved[r.media_id].url;
        r.media_kind = resolved[r.media_id].kind as "photo" | "video";
      }
    }
  }
  return rows;
}

export type GalleryItem = { id: string; kind: "photo" | "video"; url: string };

// Popup "Galerie Média" : toutes les photos/vidéos accessibles du modèle (droits gérés
// côté fonction Edge media-list, selon le forfait de l'abonné).
export async function getModelGallery(modelId: string): Promise<GalleryItem[]> {
  const supabase = await supabaseServer();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/media-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ model: modelId }),
    });
    const j = await r.json().catch(() => ({}));
    return (j?.items ?? []) as GalleryItem[];
  } catch {
    return [];
  }
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

export type SendResult = {
  reply?: string;
  error?: string;
  flagged?: boolean;
  media_url?: string | null;
  media_kind?: "photo" | "video" | null;
};

// Appelle la fonction Edge "chat" (love20) avec le JWT de l'utilisateur courant.
// Garde-fous (mineur/détresse/contenu) et persistance des messages gérés côté fonction.
// `sexy` : mode coquin, activé seulement après confirmation du client côté UI.
export async function sendMessage(
  modelId: string,
  message: string,
  sexy = false
): Promise<SendResult> {
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
      body: JSON.stringify({ model: modelId, message: text, sexy }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { error: j?.error || "server" };
    let media_url: string | null = null;
    let media_kind: "photo" | "video" | null = null;
    const mediaId: string | undefined = j?.photo?.media_id;
    if (mediaId) {
      const resolved = await resolveMediaUrls(token, [mediaId]);
      media_url = resolved[mediaId]?.url ?? null;
      media_kind = (resolved[mediaId]?.kind as "photo" | "video") ?? (j.photo?.kind ?? "photo");
    }
    return { reply: j.reply, flagged: j.flagged, media_url, media_kind };
  } catch {
    return { error: "network" };
  }
}
