import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  getAllModels,
  getModel,
  modelAvatar,
  modelCoverPhoto,
  modelCtaHref,
} from "@/lib/models";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getPublicFeed, feedMediaUrl } from "@/lib/feed";

// Pas de `revalidate` ici : les données modèles viennent d'un import JSON statique
// (snapshot pris sur l'ancien site), donc la page est déjà entièrement statique au build —
// sous Cache Components (next.config.ts), le caching dynamique se gère avec `'use cache'` +
// `cacheLife`, pas avec l'ancienne option `revalidate`. À réintroduire quand ces pages liront
// Supabase en direct.

export function generateStaticParams() {
  return getAllModels().map((m) => ({ model: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model: id } = await params;
  const m = getModel(id);
  if (!m) return {};

  const title = `${m.name}, ${m.age} ans — ${m.job} à ${m.city} | ${SITE_NAME}`;
  const description = m.tagline;
  const url = `${SITE_URL}/${m.id}/`;
  const image = modelCoverPhoto(m);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 1350 }],
      locale: "fr_FR",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: id } = await params;
  const m = getModel(id);
  if (!m) notFound();

  // Aperçu public : quelques photos réelles du modèle (posts "pub" publiés), pour que
  // la fiche montre du contenu vérifiable plutôt qu'une simple carte d'identité.
  const photos = (await getPublicFeed(60))
    .filter((p) => p.model_id === m.id && p.kind === "image" && p.media)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: m.full || m.name,
      description: m.bio,
      image: modelCoverPhoto(m),
      jobTitle: m.job,
      address: { "@type": "PostalAddress", addressLocality: m.city },
    },
  };

  return (
    <main style={{ ["--ac" as string]: m.theme?.ac || "#e4002b" }}>
      {/* Les données structurées JSON-LD sont ce que cette migration apporte de concret pour le
          référencement : chaque profil devient une page indexable avec son propre schema.org,
          plutôt qu'un état JS invisible aux moteurs de recherche. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center gap-4">
          <Image
            src={modelAvatar(m)}
            alt={m.avatarAlt}
            width={72}
            height={72}
            className="rounded-full object-cover"
            unoptimized
          />
          <div>
            <h1 className="text-2xl font-extrabold">
              {m.name}
              {m.age ? <span className="font-medium text-neutral-500"> · {m.age} ans</span> : null}
            </h1>
            <p className="text-sm text-neutral-500">{m.handleLine}</p>
          </div>
        </div>

        <p className="mt-6 text-lg leading-relaxed">{m.bio}</p>

        {m.traits?.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {m.traits.map((t) => (
              <li
                key={t}
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{ background: "color-mix(in srgb, var(--ac) 12%, #fff)", color: "color-mix(in srgb, var(--ac) 65%, #000)" }}
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        {photos.length ? (
          <ul className="mt-8 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <li key={p.id} className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src={feedMediaUrl(p.media)}
                  alt={p.caption || `Photo de ${m.name}`}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </li>
            ))}
          </ul>
        ) : null}

        <a
          href={modelCtaHref(m)}
          className="mt-8 inline-block rounded-full px-6 py-3 font-bold text-white"
          style={{ background: "var(--ac)" }}
        >
          Discuter avec {m.name}
        </a>
      </section>
    </main>
  );
}
