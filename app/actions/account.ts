"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/site";

export type AccountOverview = {
  email: string;
  firstName: string | null;
  city: string | null;
  credits: number;
  plan: string;
  subStatus: string | null;
  periodEnd: string | null;
};

const PLAN_LABEL: Record<string, string> = {
  free: "Gratuit",
  plus: "Plus",
  vip: "VIP",
  elite: "VIP Élite",
};

export async function getAccountOverview(): Promise<AccountOverview | null> {
  const supabase = await supabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, city, credits")
    .eq("id", user.id)
    .maybeSingle();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    email: user.email ?? "",
    firstName: profile?.first_name ?? null,
    city: profile?.city ?? null,
    credits: profile?.credits ?? 0,
    plan: PLAN_LABEL[sub?.plan ?? "free"] ?? "Gratuit",
    subStatus: sub?.status ?? null,
    periodEnd: sub?.current_period_end ?? null,
  };
}

export type DeleteState = { error?: string } | undefined;

export async function deleteAccount(): Promise<DeleteState> {
  const supabase = await supabaseServer();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { error: "Session expirée, reconnecte-toi." };

  const r = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (j?.error === "staff") return { error: "Un compte staff ne peut pas être supprimé ici." };
    return { error: "La suppression a échoué, réessaie plus tard." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
