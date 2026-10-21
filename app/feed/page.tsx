import type { Metadata } from "next";
import Image from "next/image";
import { getModel } from "@/lib/models";
import { getPublicFeed, feedMediaUrl } from "@/lib/feed";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Aperçu public des photos/vidéos gratuites des modèles (posts Supabase avec
// access='pub') — une vitrine indexable pour attirer du trafic, distincte du
// flux personnalisé des membres connectés (qui reste privé, sous /app/feed/).

export const metadata: Metadata = {
  title: `Feed public — les dernières photos gratuites | ${SITE_NAME}`,
  description:
    "Les dernières photos publiques de nos compagnes IA, en accès libre. Le flux complet (photos et vidéos) et privé est réservé aux membres.",
  alternates: { canonical: `${SITE_URL}/feed/` },
};

export default async function FeedPage() {
  const posts = await getPublicFeed(60);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <nav className="mb-6 text-sm text-neutral-500">
        <a href="/">Accueil</a> <span>›</span> <span>Feed</span>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Le feed public
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Un aperçu gratuit des dernières photos de nos compagnes IA. Le feed
        complet (photos et vidéos), mis à jour en continu, est réservé aux
        membres via le{" "}
        <a href="/tarifs/" className="underline">
          Pass CopineAI
        </a>
        .
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-neutral-500">
          Aucun contenu public disponible pour le moment.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {posts.map((p) => {
            const m = getModel(p.model_id);
            const alt = p.caption?.trim() || (m ? `Photo de ${m.name}` : "Photo");
            return (
              <a
                key={p.id}
                href={m ? `/${m.id}/` : "/"}
                className="group relative block aspect-square overflow-hidden rounded-xl bg-neutral-100"
              >
                <Image
                  src={feedMediaUrl(p.media)}
                  alt={alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
                {m && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {m.name}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
