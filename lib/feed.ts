import { cacheLife } from "next/cache";
export { feedMediaUrl } from "@/lib/media-url";

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

export type MemberFeedPost = FeedPost & {
  access: "pub" | "priv" | "ppv";
  price_cents: number | null;
};

// Feed privé (membres connectés, compte actif) : pub + priv + ppv, via la fonction Postgres
// member_feed_v2 (SECURITY DEFINER) — la table posts n'est pas lisible directement par un
// membre standard (RLS réservée au staff). v2 (08/11/2026, #127) ajoute access/price_cents
// et les posts "ppv" (déblocage par crédit, Tâche #90, toujours pas construit côté paiement —
// ces posts restent donc toujours affichés verrouillés, jamais débloqués) par rapport à
// l'ancienne member_feed, pour permettre les vrais filtres Public/Privé/Bloqué de /app/feed/
// (parité avec love20) plutôt que la grille plate sans distinction d'avant. Fonction créée
// à côté de member_feed (jamais DROP, confirmation destructive refusée par l'outil de
// migration) : l'ancienne reste en place, inutilisée, jusqu'à nettoyage ultérieur.
export async function getMemberFeed(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  limit = 60
): Promise<MemberFeedPost[]> {
  const { data, error } = await supabase.rpc("member_feed_v2", { p_limit: limit });
  if (error || !data) return [];
  return data as MemberFeedPost[];
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

export type MediaItem = {
  id: string;
  model_id: string;
  kind: "photo" | "video";
  caption: string | null;
  path: string;
  thumb_path: string | null;
  created_at: string;
};

export type AuthMediaItem = {
  id: string;
  kind: "photo" | "video";
  visibility: "public" | "private" | "blocked";
  title: string | null;
  caption: string | null;
  created_at: string;
  path: string | null; // non-null seulement si l'appelant (anon ou connecté) y a droit
  thumb_path: string | null; // aperçu toujours public/sûr, même pour du contenu privé
  mime: string | null;
};

// Fiche modèle consciente de la session (10/11/2026) : avant, cette page lisait TOUJOURS la
// clé anon, donc ne reconnaissait jamais un abonné connecté (contenu privé jamais débloqué
// ici, contrairement à /app/vente/ sur love20 qui lit la vraie session — d'où "2 comptes").
// model_media_feed (RPC déjà existante, utilisée par m_content.js admin et index.html coté
// love20) vérifie elle-même auth.uid() + l'abonnement : appelée avec le client serveur de
// l'abonné (supabaseServer(), cookies de session), elle renvoie un vrai path pour le contenu
// public ET pour le privé/bloqué auquel il a droit ; null sinon. Anonyme ou non-abonné : même
// résultat qu'avant (path=null sur tout ce qui n'est pas public), sans code séparé.
export async function getAuthModelMedia(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  modelId: string,
  limit = 60
): Promise<AuthMediaItem[]> {
  const { data, error } = await supabase.rpc("model_media_feed", {
    p_model: modelId,
    p_limit: limit,
    p_offset: 0,
  });
  if (error || !data) return [];
  return data as AuthMediaItem[];
}

// Les paths "entitled" renvoyés par model_media_feed pour du contenu privé/bloqué vivent dans
// le bucket media-private (jamais public) : il faut une URL signée, comme déjà fait côté admin
// (m_content.js) et côté chat/VIP de love20 (index.html, createSignedUrls). Le contenu public
// n'a pas besoin de ça (feedMediaUrl suffit, bucket media-public).
export async function signPrivateMedia(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  paths: string[]
): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data } = await supabase.storage
    .from("media-private")
    .createSignedUrls(paths, 10800);
  const map: Record<string, string> = {};
  (data ?? []).forEach((o) => {
    if (o.signedUrl && o.path) map[o.path] = o.signedUrl;
  });
  return map;
}

// Photothèque (#125, 22/10/2026) : vraie source de la grille "Public" d'une fiche modèle —
// table public.media (gérée depuis l'admin "Photothèque"), distincte de public.posts (le
// fil "feed" séparé). RLS avait déjà la policy media_read_public mais aucun GRANT pour anon
// (migration grant_anon_select_public_media) : sans lui l'API REST renvoyait une liste vide
// même avec la bonne policy. Restriction volontairement plus stricte ici que ce que permet
// la RLS : on ne lit QUE visibility=public (jamais private/blocked/draft) pour cette page
// publique, même si la policy autoriserait aussi "private".
export async function getModelMedia(modelId: string, limit = 60): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");

  const url =
    `${SUPABASE_URL}/rest/v1/media` +
    `?select=id,model_id,kind,caption,path,thumb_path,created_at` +
    `&active=eq.true&visibility=eq.public&model_id=eq.${encodeURIComponent(modelId)}` +
    `&order=created_at.desc&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as MediaItem[];
  } catch {
    return [];
  }
}

// Reels d'un modèle (10/11/2026) : derniers posts publics (image + vidéo, contrairement à
// getPublicFeed qui exclut les vidéos faute de poster) pour le nouvel onglet "Reels" de la
// fiche modèle. La lecture avec fond sonore reste côté love20 (seule à l'avoir aujourd'hui) —
// ici on ne fait que les vignettes ; le clic renvoie vers modelCtaHref, pas une URL devinée.
export async function getModelReels(modelId: string, limit = 12): Promise<FeedPost[]> {
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
