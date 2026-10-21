import { cacheLife } from "next/cache";

// Supabase : clé publique "anon" (conçue pour être exposée côté client, ce n'est pas un
// secret) + une policy RLS dédiée, restreinte aux posts publics, ajoutée spécifiquement
// pour cette page (migrations allow_anon_read_public_posts + grant_anon_select_posts —
// Postgres exige à la fois un GRANT et une policy RLS, l'un sans l'autre ne suffit pas) —
// aucune autre donnée n'est accessible avec cette clé.
const SUPABASE_URL = "https://allbwtoexfxupksbvfnh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbGJ3dG9leGZ4dXBrc2J2Zm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDY1NDgsImV4cCI6MjEwNjg4MjU0OH0.XwJ6ZomN3tHgqaQqkQc_np86D0hsIteZcjxDeM1Ami8";

export type FeedPost = {
  id: string;
  model_id: string;
  kind: "image" | "video";
  caption: string | null;
  media: string;
  poster: string | null;
  published_at: string;
};

const MEDIA_BASE =
  "https://allbwtoexfxupksbvfnh.supabase.co/storage/v1/object/public/media-public/";

export function feedMediaUrl(path: string): string {
  return `${MEDIA_BASE}${path}`;
}

// Feed privé (membres connectés, compte actif) : pub + priv, via la fonction Postgres
// member_feed (SECURITY DEFINER) — la table posts n'est pas lisible directement par un
// membre standard (RLS réservée au staff). Jamais de contenu "ppv" ici (déblocage par
// crédit, Tâche #90, pas encore construit).
export async function getMemberFeed(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  limit = 60
): Promise<FeedPost[]> {
  const { data, error } = await supabase.rpc("member_feed", { p_limit: limit });
  if (error || !data) return [];
  return data as FeedPost[];
}

// Fiche modèle (#123, 22/10/2026) : contenu public réel d'UN modèle (photos + vidéos),
// pour la grille "Public" de la vraie fiche profil (cf app/[model]/page.tsx). Même
// restriction RLS que getPublicFeed (clé anon, posts access=pub/status=published
// uniquement) — on ne peut PAS lire le nombre réel de posts "priv"/"ppv" avec cette
// clé (RLS les cache entièrement, y compris pour un COUNT), donc les onglets Privé/
// Bloqué de la fiche restent des teasers génériques, sans compteur exact.
export async function getModelFeed(modelId: string, limit = 60): Promise<FeedPost[]> {
  "use cache";
  cacheLife("hours");

  const url =
    `${SUPABASE_URL}/rest/v1/posts` +
    `?select=id,model_id,kind,caption,media,poster,published_at` +
    `&status=eq.published&access=eq.pub&model_id=eq.${encodeURIComponent(modelId)}` +
    `&order=published_at.desc&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as FeedPost[];
  } catch {
    return [];
  }
}

export async function getPublicFeed(limit = 60): Promise<FeedPost[]> {
  "use cache";
  cacheLife("hours");

  // Uniquement des photos (kind=image) : les vidéos publiques n'ont pas de poster
  // (colonne poster toujours nulle en base pour l'instant), donc une vignette vidéo
  // ici s'affichait en vignette grise vide (pas d'erreur, juste rien à montrer avant
  // lecture, preload="none") — demande explicite : le feed public doit être des photos.
  const url =
    `${SUPABASE_URL}/rest/v1/posts` +
    `?select=id,model_id,kind,caption,media,poster,published_at` +
    `&status=eq.published&access=eq.pub&kind=eq.image` +
    `&order=published_at.desc&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as FeedPost[];
  } catch {
    // Réseau indisponible (ex. au build, dans un environnement sans accès sortant) :
    // la page s'affiche avec une liste vide plutôt que de faire échouer le build entier.
    return [];
  }
}
