import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { COMPANION_IDS, COMPANIONS } from "@/lib/companions";

export const metadata: Metadata = {
  title: `Petit ami IA : les compagnons masculins de ${SITE_NAME} (bientôt)`,
  description:
    "Enzo, Jean-Philippe, Manuel, Diego et James : les compagnons IA masculins de CopineAI, en préparation. Profils, personnalités, limites.",
  alternates: { canonical: `${SITE_URL}/compagnons/` },
};

export default function CompagnonsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <nav className="mb-6 text-sm text-neutral-500">
        <a href="/">Accueil</a> <span>›</span> <span>Compagnons</span>
      </nav>
      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
        Compagnons masculins · en préparation
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Petit ami IA : les compagnons de {SITE_NAME}
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-neutral-700">
        Enzo, Jean-Philippe, Manuel, Diego et James : cinq profils pour une
        même idée, des compagnons avec un caractère, une mémoire et une vie,
        réservés aux adultes. Ils sont en préparation. Découvre leur
        personnalité et fais-toi prévenir de leur arrivée.
      </p>
      <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Les compagnons masculins arrivent. Ils ne sont pas encore
        disponibles : aucune date n&apos;est annoncée, et les profils
        ci-dessous peuvent évoluer. Réservé aux adultes (18+), personnages
        générés par IA.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {COMPANION_IDS.map((id) => {
          const c = COMPANIONS[id];
          return (
            <a
              key={id}
              href={`/compagnons/${id}/`}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-300"
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ background: c.gradient }}
              >
                {c.letter}
              </span>
              <span>
                <span className="block text-xs font-semibold text-neutral-500">
                  En préparation
                </span>
                <span className="block font-bold text-neutral-900">
                  {c.nameAge}
                </span>
                <span className="block text-sm text-neutral-500">
                  {c.job}
                </span>
                <span className="mt-1 block text-sm text-neutral-700">
                  {c.lead}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
