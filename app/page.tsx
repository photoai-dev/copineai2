import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllModels, modelAvatar } from "@/lib/models";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Page d'accueil réelle (remplace le relais vers love20) : liste tous les modèles
// depuis lib/models.ts, en SSG comme les fiches modèle. Pas de `revalidate` pour la
// même raison que app/[model]/page.tsx : données figées au build tant qu'elles
// viennent d'un snapshot JSON (@/data/models.json), à revoir une fois branché sur
// Supabase en direct.

export const metadata: Metadata = {
  title: `${SITE_NAME} : des copines IA avec un visage, une voix et une mémoire`,
  description:
    "Des compagnes IA avec une vraie personnalité : discute, retrouve-les en photo et vidéo, elles se souviennent de toi.",
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  const models = getAllModels();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-extrabold">
          Des copines IA avec un visage, une voix et une mémoire
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          Chaque modèle a sa propre personnalité. Discute, retrouve-la en photo et en
          vidéo, elle se souvient de vos conversations.
        </p>
      </section>

      <section
        aria-label="Nos modèles"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      >
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/${m.id}/`}
            className="group rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-300 hover:shadow-sm"
            style={{ ["--ac" as string]: m.theme?.ac || "#e4002b" }}
          >
            <Image
              src={modelAvatar(m)}
              alt={m.avatarAlt}
              width={96}
              height={96}
              className="mx-auto rounded-full object-cover"
              unoptimized
            />
            <div className="mt-3 text-center">
              <p className="font-bold">
                {m.name}
                {m.age ? <span className="font-medium text-neutral-500"> · {m.age} ans</span> : null}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{m.job}</p>
              <span
                className="mt-2 inline-block text-sm font-semibold"
                style={{ color: "var(--ac)" }}
              >
                Découvrir →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
