import "server-only";
import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

// Session + profil courant, mémoïsés pour la durée du render (évite les doublons
// d'appels Supabase quand plusieurs composants d'une même page en ont besoin).
export const getSessionUser = cache(async () => {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export type ProfileStatus = {
  profileCompleted: boolean;
  firstName: string | null;
};

export const getProfileStatus = cache(async (): Promise<ProfileStatus | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("first_name, profile_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  return {
    profileCompleted: Boolean(data?.profile_completed_at),
    firstName: data?.first_name ?? null,
  };
});
