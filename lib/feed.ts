import { cacheLife } from "next/cache";

// Supabase : clé publique "anon" (conçue pour être exposée côté client, ce n'est pas un
// secret) + une policy RLS dédiée, restreinte aux posts publics, ajoutée spécifiquement
// pour cette page (migration allow_anon_read_public_posts) — aucune autre donnée n'est
// accessible avec cette clé.
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

export async function getPublicFeed(limit = 60): Promise<FeedPost[]> {
  "use cache";
  cacheLife("hours");

  const url =
    `${SUPABASE_URL}/rest/v1/posts` +
    `?select=id,model_id,kind,caption,media,poster,published_at` +
    `&status=eq.published&access=eq.pub` +
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
