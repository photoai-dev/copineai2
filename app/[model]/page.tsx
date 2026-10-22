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
import { getModelMedia, feedMediaUrl } from "@/lib/feed";

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

// Vraie fiche modèle (#123 → #125, 22/10/2026) : remplace le relais vers love20 (#121/#122).
// Le relais donnait le bon menu mais un contenu figé à la snapshot du 08/10 (love20
// gelé, jamais redéployé, ne lit ni posts ni media). Cette page lit Supabase en direct :
// bannière, stats, onglets Public/Privé/Bloqué en CSS pur (même recette que la sidebar).
// La grille "Public" et les compteurs viennent de public.media (#125) — la vraie
// photothèque gérée depuis l'admin (filtres Modèle/Origine/Type/Visibilité), PAS de
// public.posts (qui alimente le fil /feed/ séparé) : c'est "media" que l'admin remplit,
// donc c'est "media" que les modèles comme Kim & Anaïs (libertine) y voient apparaître.
// Privé/Bloqué restent des teasers génériques sans compteur : la clé anon ne lit que
// visibility=public (restriction volontaire, cf lib/feed.ts), donc pas de chiffre inventé.
export default async function ModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: id } = await params;
  const m = getModel(id);
  if (!m) notFound();

  const media = await getModelMedia(m.id, 60);
  const images = media.filter((p) => p.kind === "photo" && p.path);
  const videos = media.filter((p) => p.kind === "video" && p.path);

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

      <div className="mp-banner">
        <Image
          src={modelCoverPhoto(m)}
          alt={`Photo de couverture de ${m.name}`}
          fill
          sizes="100vw"
          unoptimized
          priority
        />
      </div>

      <div className="mp-head">
        <Image
          src={modelAvatar(m)}
          alt={m.avatarAlt}
          width={88}
          height={88}
          className="mp-avatar"
          unoptimized
        />
        <div>
          <h1>
            {m.name}
            {m.age ? <span> · {m.age} ans</span> : null}
          </h1>
        </div>
      </div>
      <p className="mp-sub">{m.handleLine}</p>

      <div className="mp-stats">
        <div>
          <b>{images.length}</b>
          <span>publications</span>
        </div>
        <div>
          <b>{videos.length}</b>
          <span>vidéos</span>
        </div>
      </div>

      <p className="mp-bio">{m.bio}</p>

      {m.traits?.length ? (
        <ul className="mp-traits">
          {m.traits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}

      <div className="mp-cta">
        <a href="/tarifs/" className="mp-sub-btn">
          S&apos;abonner
        </a>
        <a href={modelCtaHref(m)} className="mp-msg-btn">
          Discuter avec {m.name}
        </a>
      </div>

      <div className="mp-tabset">
        <input type="radio" name="mp-tab" id="mp-t-pub" className="mp-tab-input" defaultChecked />
        <input type="radio" name="mp-tab" id="mp-t-priv" className="mp-tab-input" />
        <input type="radio" name="mp-tab" id="mp-t-bloq" className="mp-tab-input" />

        <div className="mp-tabbar">
          <label htmlFor="mp-t-pub">Public</label>
          <label htmlFor="mp-t-priv">Privé</label>
          <label htmlFor="mp-t-bloq">Bloqué</label>
        </div>

        <div className="mp-panel" data-panel="pub">
          {images.length || videos.length ? (
            <ul className="mp-grid">
              {images.map((p) => (
                <li key={p.id}>
                  <Image
                    src={feedMediaUrl(p.path)}
                    alt={p.caption || `Photo de ${m.name}`}
                    width={300}
                    height={400}
                    unoptimized
                  />
                </li>
              ))}
              {videos.map((p) => (
                <li key={p.id}>
                  {p.thumb_path ? (
                    <Image
                      src={feedMediaUrl(p.thumb_path)}
                      alt={p.caption || `Vidéo de ${m.name}`}
                      width={300}
                      height={400}
                      unoptimized
                    />
                  ) : null}
                  <span className="mp-vid" aria-hidden="true">
                    ▶
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mp-empty">Pas encore de publication publique.</p>
          )}
        </div>

        <div className="mp-panel" data-panel="priv">
          <div className="mp-locked">
            <h3>Contenu réservé aux abonnés</h3>
            <p>
              {m.name} partage des photos et vidéos privées avec ses abonnés. Abonne-toi pour y
              accéder.
            </p>
            <a href="/tarifs/" className="mp-sub-btn">
              S&apos;abonner
            </a>
          </div>
        </div>

        <div className="mp-panel" data-panel="bloq">
          <div className="mp-locked">
            <h3>Contenu à débloquer</h3>
            <p>
              Certaines publications de {m.name} se débloquent individuellement. Discute avec elle
              pour les découvrir.
            </p>
            <a href={modelCtaHref(m)} className="mp-msg-btn">
              Discuter avec {m.name}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
