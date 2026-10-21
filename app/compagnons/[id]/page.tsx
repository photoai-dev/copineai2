import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { COMPANION_IDS, getCompanion } from "@/lib/companions";

export function generateStaticParams() {
  return COMPANION_IDS.map((id) => ({ id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const c = getCompanion(params.id);
  if (!c) return {};
  return {
    title: `${c.nameAge} | Compagnons ${SITE_NAME} (bientôt)`,
    description: `${c.nameAge}, ${c.job}. ${c.lead}`,
    alternates: { canonical: `${SITE_URL}/compagnons/${params.id}/` },
  };
}

export default function CompagnonPage({
  params,
}: {
  params: { id: string };
}) {
  const c = getCompanion(params.id);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm text-neutral-500">
        <a href="/">Accueil</a> <span>›</span>{" "}
        <a href="/compagnons/">Compagnons</a> <span>›</span>{" "}
        <span>{c.nameAge.split(",")[0]}</span>
      </nav>
      <div className="flex items-center gap-4">
        <span
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ background: c.gradient }}
        >
          {c.letter}
        </span>
        <div>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            Compagnon IA · en préparation
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {c.nameAge}
          </h1>
          <p className="text-neutral-500">{c.job}</p>
        </div>
      </div>
      <p className="mt-4 text-lg leading-relaxed text-neutral-800">
        {c.lead}
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        <b>Rôle principal :</b> {c.role}
      </p>
      <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Les compagnons masculins arrivent. Ils ne sont pas encore
        disponibles : aucune date n&apos;est annoncée. Réservé aux adultes
        (18+), personnages générés par IA.
      </p>
      <div className="mt-2 flex gap-3">
        <a
          href={`/compagnons/${params.id}/`}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Me prévenir de son arrivée
        </a>
        <a
          href="/compagnons/"
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700"
        >
          Voir les autres
        </a>
      </div>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-lg font-bold tracking-tight">
            Qui est {c.nameAge.split(",")[0]}
          </h2>
          <p className="mt-1.5 leading-relaxed text-neutral-700">{c.bio}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {c.traits.map((t) => (
              <li
                key={t}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-tight">
            Sa façon de parler
          </h2>
          <p className="mt-1.5 leading-relaxed text-neutral-700">
            {c.speech}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-tight">
            Un exemple d&apos;échange (fictif)
          </h2>
          <div className="mt-2 space-y-2">
            {c.dialogue.map((d, i) => (
              <div
                key={i}
                className={
                  d.who === "Toi"
                    ? "ml-auto max-w-[80%] rounded-2xl bg-neutral-900 px-4 py-2 text-sm text-white"
                    : "max-w-[80%] rounded-2xl bg-neutral-100 px-4 py-2 text-sm text-neutral-800"
                }
              >
                <span className="block text-[11px] font-semibold opacity-60">
                  {d.who}
                </span>
                {d.text}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-tight">
            Ce qu&apos;il aime, ses humeurs, ses rôles
          </h2>
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Il aime</h3>
              <ul className="mt-1 list-disc pl-4 text-sm text-neutral-700">
                {c.likes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Ses humeurs
              </h3>
              <ul className="mt-1 list-disc pl-4 text-sm text-neutral-700">
                {c.moods.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Avec lui
              </h3>
              <ul className="mt-1 list-disc pl-4 text-sm text-neutral-700">
                {c.withHim.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
