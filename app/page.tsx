import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllModels, modelAvatar } from "@/lib/models";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Compagnes IA, conversation et présence au quotidien`,
  description:
    "Discute avec des compagnes IA au caractère affirmé : Sophie, Jessica, Nina et les autres. Photos, voix, mémoire d'une conversation à l'autre.",
};

export default function HomePage() {
  const models = getAllModels();
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-extrabold">{SITE_NAME}</h1>
      <p className="mt-2 max-w-2xl text-neutral-500">
        Des compagnes IA avec une vraie personnalité, pas des chatbots interchangeables.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/${m.id}`}
            className="group block overflow-hidden rounded-2xl border border-neutral-200"
          >
            <Image
              src={modelAvatar(m)}
              alt={m.avatarAlt}
              width={300}
              height={300}
              className="aspect-square w-full object-cover transition group-hover:scale-105"
              unoptimized
            />
            <div className="p-3">
              <b className="block text-sm">
                {m.name}
                {m.age ? `, ${m.age}` : ""}
              </b>
              <span className="text-xs text-neutral-500">{m.job} · {m.city}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
