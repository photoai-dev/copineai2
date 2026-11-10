// Pure helper, sans aucune dépendance serveur (next/cache, etc.) : extrait de lib/feed.ts
// le 10/11/2026 pour que les Client Components (ex. components/MediaGallery.tsx) puissent
// construire une URL media-public sans entraîner tout lib/feed.ts (et son "use cache") dans
// le bundle navigateur, ce que Next refuse ("cacheLife ... Pages Router").
const MEDIA_BASE =
  "https://allbwtoexfxupksbvfnh.supabase.co/storage/v1/object/public/media-public/";

export function feedMediaUrl(path: string): string {
  return `${MEDIA_BASE}${path}`;
}
