"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/site";

// Fonction Edge "live" (love20) : avatar Vivix temps réel (TRTC + WebSocket de contrôle),
// facturé en crédits. "eligible" ne nécessite pas de session utilisateur réelle (la clé anon
// suffit, la fonction exige seulement un JWT valide côté plateforme Supabase) ; les autres
// actions exigent le jeton de l'utilisateur connecté.

export type LivePricing = { entry_credits: number; per_minute_credits: number };
export type LiveLook = { key: string; label: string; credits: number; kind: "outfit" | "scene" };

export async function getLiveEligible(): Promise<{
  eligible: Record<string, boolean>;
  pricing: LivePricing;
  photos: Record<string, string>;
}> {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/live`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: "eligible" }),
    });
    const j = await r.json().catch(() => ({}));
    return {
      eligible: j.eligible ?? {},
      pricing: j.pricing ?? { entry_credits: 20, per_minute_credits: 4 },
      photos: j.photos ?? {},
    };
  } catch {
    return { eligible: {}, pricing: { entry_credits: 20, per_minute_credits: 4 }, photos: {} };
  }
}

async function authToken(): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function call(action: string, extra: Record<string, unknown> = {}) {
  const token = await authToken();
  if (!token) return { error: "auth" };
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ action, ...extra }),
    });
    const j = await r.json().catch(() => ({}));
    return { _status: r.status, ...j };
  } catch {
    return { error: "network" };
  }
}

export type LiveSession = {
  session_id?: string;
  reused?: boolean;
  error?: string;
  _status?: number;
  pricing?: LivePricing;
  looks?: LiveLook[];
  control?: { url: string; client_secret: string };
  delivery?: { media?: { trtc?: Record<string, unknown> } };
};

export async function startLive(modelId: string): Promise<LiveSession> {
  return call("start", { model_id: modelId });
}
export async function heartbeatLive(sessionId: string) {
  return call("heartbeat", { session_id: sessionId });
}
export async function closeLive(sessionId: string) {
  return call("close", { session_id: sessionId });
}
export async function giftOutfit(sessionId: string, key: string) {
  return call("gift_outfit", { session_id: sessionId, key });
}
export async function giftSettle(chargeId: string, applied: boolean) {
  return call("gift_settle", { charge_id: chargeId, applied });
}
