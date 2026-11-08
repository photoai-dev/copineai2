import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicFeed, feedMediaUrl } from "@/lib/feed";
import { getModel } from "@/lib/models";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Feed public (08/11/2026, #127) : remplace le relais vers love20 (grille plate déjà
// relayée) — vraie page Next.js, contenu public réel (posts access=pub) lu en direct
// depuis Supabase (getPublicFeed, déjà écrite, jusqu'ici inutilisée). Les onglets Privé/
// Bloqué n'ont pas de sens ici sans compte (ils redirigent vers /compte/) : c'est la
// version membre, /app/feed/, qui les affiche avec de vrais verrous "Pass requis".
export const metadata: Metadata = {
  title: `Feed — ${SITE_NAME}`,
  description: "Les dernières photos publiques de toutes les modèles CopineAI.",
  alternates: { canonical: `${SITE_URL}/feed/` },
};

export default async function PublicFeedPage() {
  const posts = await getPublicFeed(90);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Le feed</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Les dernières photos publiques de toutes les modèles.{" "}
        <Link href="/compte/" className="underline">
          Connecte-toi
        </Link>{" "}
        pour voir le feed privé complet de chacune.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-sm text-neutral-500">Rien à afficher pour le moment.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {posts.map((p) => {
            const m = getModel(p.model_id);
            const alt = p.caption?.trim() || (m ? `Photo de ${m.name}` : "Photo");
            return (
              <Link
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
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
