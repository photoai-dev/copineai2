import type { Metadata } from "next";
import Image from "next/image";
import { getAllModels, modelAvatar } from "@/lib/models";
import { getLiveEligible } from "@/app/actions/live";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Live — ${SITE_NAME}` };
export const instant = false;

export default async function LiveHubPage() {
  const models = getAllModels();
  const { eligible, pricing, photos } = await getLiveEligible();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Live</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Avatar en direct, voix et vidéo — {pricing.entry_credits} crédits à l'ouverture, puis{" "}
        {pricing.per_minute_credits} crédits par minute.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {models.map((m) => {
          const ok = Boolean(eligible[m.id]);
          const cover = photos[m.id];
          return (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-neutral-200">
              <div className="relative aspect-[3/4] bg-neutral-100">
                <Image
                  src={cover || modelAvatar(m)}
                  alt={m.name}
                  fill
                  sizes="25vw"
                  className="object-cover"
                  unoptimized={Boolean(cover)}
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    ok ? "bg-emerald-500 text-white" : "bg-white/80 text-neutral-500"
                  }`}
                >
                  {ok ? "● Live disponible" : "● En ligne"}
                </span>
              </div>
              <div className="p-3">
                <b className="block text-sm">{m.name}</b>
                {ok ? (
                  <a
                    href={`/app/live/${m.id}/`}
                    className="mt-2 block rounded-full bg-neutral-900 px-3 py-1.5 text-center text-xs font-semibold text-white"
                  >
                    Lancer le live · {pricing.entry_credits} crédits
                  </a>
                ) : (
                  <a
                    href={`/app/me/?m=${m.id}`}
                    className="mt-2 block rounded-full border border-neutral-300 px-3 py-1.5 text-center text-xs font-semibold"
                  >
                    Discuter
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
