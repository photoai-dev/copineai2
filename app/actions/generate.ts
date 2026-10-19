"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/site";

export type GenJob = {
  id: string;
  kind: string;
  model_id: string;
  status: "running" | "queued" | "done" | "failed" | "rejected";
  error?: string | null;
  url?: string | null;
};

export type GenResult = { id?: string; error?: string; detail?: string };

async function authToken(): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function callGen(body: Record<string, unknown>) {
  const token = await authToken();
  if (!token) return { error: "auth" } as const;
  const r = await fetch(`${SUPABASE_URL}/functions/v1/gen`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, data: j } as const;
}

// Lance une génération (pour l'instant : photo uniquement — vidéo/audio dans une
// itération suivante). Crédits/quotas/modération gérés côté fonction Edge "gen".
export async function createGeneration(modelId: string, prompt: string): Promise<GenResult> {
  const res = await callGen({ action: "create", model_id: modelId, kind: "photo", prompt });
  if (!("ok" in res)) return { error: res.error };
  if (!res.ok) return { error: res.data?.error || "server", detail: res.data?.detail };
  return { id: res.data.id };
}

export async function getGeneration(id: string): Promise<GenJob | null> {
  const res = await callGen({ action: "get", id });
  if (!("ok" in res) || !res.ok) return null;
  return res.data as GenJob;
}
