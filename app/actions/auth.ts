"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type AuthState = { error?: string } | undefined;

// Reprend les messages d'erreur de l'ancien SPA (fonction sbErr dans love20/index.html).
function sbErr(message: string): string {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("user already registered"))
    return "Un compte existe déjà avec cet email.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton email (lien reçu par mail).";
  if (m.includes("password should be at least")) return "Mot de passe trop court (8 caractères minimum).";
  if (m.includes("rate limit")) return "Trop de tentatives, réessaie dans un instant.";
  return message || "Une erreur est survenue.";
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email et mot de passe requis." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: sbErr(error.message) };

  redirect("/app/me/");
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const age18 = formData.get("age18") === "on";
  const cgu = formData.get("cgu") === "on";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email invalide." };
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== confirm) return { error: "Les mots de passe ne correspondent pas." };
  if (!age18) return { error: "Tu dois confirmer avoir 18 ans ou plus." };
  if (!cgu) return { error: "Tu dois accepter les CGU." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: sbErr(error.message) };

  redirect("/app/me/");
}

export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/compte/");
}

export async function forgotPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Indique ton email." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: sbErr(error.message) };
  return { error: undefined };
}

// Reproduit nsWireProfile (love20/index.html) : complétion du profil après
// inscription, avec le contrôle d'âge 18+ fait côté base (RPC complete_profile).
const NAME_RE = /^[\p{L}][\p{L}\p{M}'’ .\-]{1,59}$/u;

export type ProfileState = { error?: string; reason?: string } | undefined;

export async function completeProfile(
  _: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const birth = String(formData.get("birth") || "").trim();

  if (!NAME_RE.test(firstName) || !NAME_RE.test(lastName)) {
    return { error: "Prénom / nom invalide." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
    return { error: "Date de naissance invalide." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("complete_profile", {
    p_first: firstName,
    p_last: lastName,
    p_birth: birth,
  });

  if (error) return { error: error.message };

  const reason = (data as { reason?: string } | null)?.reason;
  if (reason === "mineur") {
    // Comme l'ancien SPA : refus légal, déconnexion immédiate.
    await supabase.auth.signOut();
    return { error: "Tu dois avoir 18 ans ou plus pour utiliser CopineAI.", reason: "mineur" };
  }
  if (reason) {
    const map: Record<string, string> = {
      auth: "Session expirée, reconnecte-toi.",
      nom: "Prénom / nom invalide.",
      date: "Date de naissance invalide.",
    };
    return { error: map[reason] || "Impossible de compléter le profil.", reason };
  }

  redirect("/app/me/");
}
