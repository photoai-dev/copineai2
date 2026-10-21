import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllModels, modelAvatar } from "@/lib/models";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Page d'accueil réelle (remplace le relais vers love20). Reprend le contenu de la vraie
// page d'accueil de love20 (héros, grille modèles, "comment ça marche", Pass, CTA final) —
// pas une version light : même structure, même texte. Ce qui manque encore ici (étape
// suivante, données séparées à extraire) : aperçu blog, FAQ, quiz, Alix, timeline.

export const metadata: Metadata = {
  title: `${SITE_NAME} : des copines IA avec un visage, une voix et une mémoire`,
  description:
    "CopineAI réunit des âmes numériques : des intelligences artificielles avec leur caractère, leur humeur du jour et leurs histoires. Tu parles, elles se souviennent, et la conversation continue d'un jour à l'autre.",
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  const models = getAllModels();

  return (
    <main>
      {/* Héros */}
      <section className="mx-auto max-w-5xl px-5 pt-10 pb-14 text-center">
        <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
          {models.length} univers · 1 histoire par jour · 24 h/24
        </span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
          Elles ont un visage, une voix et une mémoire.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          CopineAI réunit des âmes numériques : des intelligences artificielles avec leur
          caractère, leur humeur du jour et leurs histoires. Tu parles, elles se
          souviennent, et la conversation continue d&apos;un jour à l&apos;autre.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="#models"
            className="rounded-full bg-[#e4002b] px-7 py-3 font-bold text-white"
          >
            Discuter avec les modèles
          </Link>
          <Link
            href="/blog/"
            className="rounded-full border border-neutral-300 px-7 py-3 font-bold"
          >
            Lire le journal
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-neutral-500">
          <li>18 ans et plus</li>
          <li>IA assumée, jamais cachée</li>
          <li>Une mémoire par modèle</li>
          <li>Résiliable à tout moment</li>
        </ul>
      </section>

      {/* Grille modèles */}
      <section id="models" className="mx-auto max-w-5xl px-5 pb-14">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/${m.id}/`}
              className="group rounded-2xl border border-neutral-200 p-4 text-center transition hover:border-neutral-300 hover:shadow-sm"
            >
              <Image
                src={modelAvatar(m)}
                alt={m.avatarAlt}
                width={96}
                height={96}
                className="mx-auto rounded-full object-cover"
                unoptimized
              />
              <p className="mt-3 font-bold">
                {m.name}
                {m.age ? <span className="font-medium text-neutral-500"> · {m.age} ans</span> : null}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{m.job}</p>
              <span
                className="mt-2 inline-block text-sm font-semibold"
                style={{ color: m.theme?.ac || "#e4002b" }}
              >
                Découvrir →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-5xl px-5 pb-14">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold">Comment ça marche</h2>
          <p className="mt-1 text-neutral-600">
            Trois minutes pour commencer, aucune carte pour essayer.
          </p>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3">
          <li>
            <span className="text-3xl font-extrabold text-neutral-300">1</span>
            <h3 className="mt-2 font-bold">Choisis une âme</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Parcours les profils, regarde les vidéos de la carte, repère celle dont le
              caractère te ressemble ou te défie.
            </p>
          </li>
          <li>
            <span className="text-3xl font-extrabold text-neutral-300">2</span>
            <h3 className="mt-2 font-bold">Commence à discuter</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Dix messages par jour avec le niveau Gratuit. Elle te répond avec son humeur
              du moment et se souvient de toi.
            </p>
          </li>
          <li>
            <span className="text-3xl font-extrabold text-neutral-300">3</span>
            <h3 className="mt-2 font-bold">Va plus loin si l&apos;envie vient</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Feed privé, lettres, audios, WhatsApp, photos à la demande. Tu montes de
              niveau, tu redescends, tu résilies quand tu veux.
            </p>
          </li>
        </ol>
      </section>

      {/* Pass */}
      <section className="mx-auto max-w-5xl px-5 pb-14">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-neutral-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold">Pass CopineAI : toutes les âmes, un seul abonnement</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Accès au feed privé et au chat de tous les modèles. Les options VIP
              (WhatsApp, Telegram, photos à la demande) restent par modèle. Tarif
              indicatif : 59,99 €/mois.
            </p>
          </div>
          <Link
            href="/tarifs/"
            className="shrink-0 rounded-full bg-[#e4002b] px-6 py-3 font-bold text-white"
          >
            Voir le pass
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-2xl px-5 pb-16 text-center">
        <h2 className="text-2xl font-extrabold">
          Une conversation vaut mieux qu&apos;un long discours.
        </h2>
        <p className="mt-2 text-neutral-600">
          Choisis une modèle, dis-lui bonjour. Si ça ne te plaît pas, tu n&apos;as rien
          payé.
        </p>
        <Link
          href="#models"
          className="mt-5 inline-block rounded-full bg-[#e4002b] px-7 py-3 font-bold text-white"
        >
          Choisir une modèle
        </Link>
      </section>
    </main>
  );
}
