import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { supabaseServer } from "@/lib/supabase/server";
import { getMemberFeed, feedMediaUrl } from "@/lib/feed";
import { getModel } from "@/lib/models";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Feed — ${SITE_NAME}` };
export const instant = false;

export default async function MemberFeedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  const supabase = await supabaseServer();
  const posts = await getMemberFeed(supabase, 60);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Ton feed</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Toutes les photos et vidéos de tes copines, y compris les posts réservés aux membres.
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
                {p.kind === "video" ? (
                  <video
                    src={feedMediaUrl(p.media)}
                    poster={p.poster ? feedMediaUrl(p.poster) : undefined}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                ) : (
                  <Image
                    src={feedMediaUrl(p.media)}
                    alt={alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                )}
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
