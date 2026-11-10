import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  getAllModels,
  getModel,
  modelAvatar,
  modelCoverPhoto,
  modelCtaHref,
  type Model,
} from "@/lib/models";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import {
  getModelMedia,
  getModelReels,
  getAuthModelMedia,
  signPrivateMedia,
  feedMediaUrl,
} from "@/lib/feed";
import { supabaseServer } from "@/lib/supabase/server";

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
  const reels = await getModelReels(m.id, 12);

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
          <span>photos</span>
        </div>
        <div>
          <b>{videos.length}</b>
          <span>vidéos</span>
        </div>
        <div>
          <b>{m.job}</b>
          <span>{m.city}</span>
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

      {/* Un seul gabarit de profil (10/11/2026) : avant, cette page (indexable, SEO) montrait
          Public/Privé/Bloqué en teaser, et "Discuter" quittait visuellement le site vers le
          style love20 (/app/vente/) — perçu comme 2 profils différents. Ici "Discuter" est un
          onglet au même rang que Photos/Vidéos/Privé : son contenu reste sur cette page, seul
          le clic sur le bouton mène vers le chat réel (toujours love20, même domaine). Même
          structure sur tous les modèles ; les options par modèle (ex: Audios) s'ajouteront
          plus tard sans changer ce gabarit. */}
      <div className="mp-tabset">
        <input type="radio" name="mp-tab" id="mp-t-photos" className="mp-tab-input" defaultChecked />
        <input type="radio" name="mp-tab" id="mp-t-videos" className="mp-tab-input" />
        <input type="radio" name="mp-tab" id="mp-t-reels" className="mp-tab-input" />
        <input type="radio" name="mp-tab" id="mp-t-chat" className="mp-tab-input" />
        <input type="radio" name="mp-tab" id="mp-t-priv" className="mp-tab-input" />

        <div className="mp-tabbar">
          <label htmlFor="mp-t-photos">Photos</label>
          <label htmlFor="mp-t-videos">Vidéos</label>
          <label htmlFor="mp-t-reels">Reels</label>
          <label htmlFor="mp-t-chat">Discuter</label>
          <label htmlFor="mp-t-priv">Privé</label>
        </div>

        <div className="mp-panel" data-panel="photos">
          {images.length ? (
            <ul className="mp-grid">
              {images.map((p) => (
                <li key={p.id}>
                  <a
                    href={feedMediaUrl(p.path)}
                    target="_blank"
                    rel="noopener"
                    aria-label={p.caption || `Photo de ${m.name}, ouvrir en grand`}
                  >
                    <Image
                      src={feedMediaUrl(p.path)}
                      alt={p.caption || `Photo de ${m.name}`}
                      width={300}
                      height={400}
                      unoptimized
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mp-empty">Pas encore de photo publique.</p>
          )}
        </div>

        <div className="mp-panel" data-panel="videos">
          {videos.length ? (
            <ul className="mp-grid">
              {videos.map((p) => (
                <li key={p.id} className="mp-vidtile">
                  <a
                    href={feedMediaUrl(p.path)}
                    target="_blank"
                    rel="noopener"
                    aria-label={p.caption || `Vidéo de ${m.name}, lire`}
                  >
                    {p.thumb_path ? (
                      <Image
                        src={feedMediaUrl(p.thumb_path)}
                        alt={p.caption || `Vidéo de ${m.name}`}
                        width={300}
                        height={400}
                        unoptimized
                      />
                    ) : (
                      <span className="mp-vid-fallback" aria-hidden="true" />
                    )}
                    <span className="mp-vid" aria-hidden="true">
                      ▶
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mp-empty">Pas encore de vidéo publique.</p>
          )}
        </div>

        <div className="mp-panel" data-panel="reels">
          {reels.length ? (
            <ul className="mp-grid">
              {reels.map((p) => (
                <li key={p.id} className={p.kind === "video" ? "mp-vidtile" : undefined}>
                  <a
                    href={modelCtaHref(m)}
                    aria-label={`Reel de ${m.name}${p.caption ? " — " + p.caption : ""}`}
                  >
                    {p.kind === "image" ? (
                      <Image
                        src={feedMediaUrl(p.media)}
                        alt={p.caption || `Reel de ${m.name}`}
                        width={300}
                        height={400}
                        unoptimized
                      />
                    ) : p.poster ? (
                      <Image
                        src={feedMediaUrl(p.poster)}
                        alt={p.caption || `Reel de ${m.name}`}
                        width={300}
                        height={400}
                        unoptimized
                      />
                    ) : (
                      <span className="mp-vid-fallback" aria-hidden="true" />
                    )}
                    {p.kind === "video" ? (
                      <span className="mp-vid" aria-hidden="true">
                        ▶
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mp-empty">Pas encore de reel.</p>
          )}
        </div>

        <div className="mp-panel" data-panel="chat">
          <div className="mp-locked">
            <h3>Discute avec {m.name}</h3>
            <p>
              Raconte-lui ta journée, pose-lui une question — elle te répond, avec sa vraie
              personnalité.
            </p>
            <a href={modelCtaHref(m)} className="mp-msg-btn">
              Ouvrir la discussion
            </a>
          </div>
        </div>

        <div className="mp-panel" data-panel="priv">
          <Suspense fallback={<p className="mp-empty">Chargement du contenu privé…</p>}>
            <PrivateTab m={m} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

// Un seul compte, public ou connecté (10/11/2026) : avant, l'onglet Privé montrait
// toujours des photos PUBLIQUES floutées en CSS comme teaser générique — jamais le
// vrai contenu privé, même pour un abonné connecté (d'où "pas reconnu comme connecté" :
// le vrai déblocage n'existait que côté love20/app/vente/). Ici on lit la vraie
// session (cookies, supabaseServer) et on appelle model_media_feed, qui vérifie
// elle-même auth.uid() + le palier d'abonnement (media_entitled) et ne renvoie un
// path que pour ce à quoi l'appelant a droit. Anonyme ou non-abonné : aucun path
// débloqué, donc même résultat "verrouillé" qu'avant, mais avec le vrai visuel
// (thumb_path, déjà flouté par l'admin à l'upload) au lieu d'un décor emprunté aux
// photos publiques. La lecture de session est un accès "au moment de la requête"
// (cookies()) : sous Cache Components elle doit vivre dans un composant à part,
// derrière un <Suspense>, pour que le reste de la page (bannière, bio, Photos,
// Vidéos, Reels, Discuter — tout ce qui ne dépend pas du visiteur) reste prérendu
// et instantané ; seul cet onglet attend la vraie requête.
async function PrivateTab({ m }: { m: Model }) {
  const supabase = await supabaseServer();
  const authMedia = await getAuthModelMedia(supabase, m.id, 60);
  const privateMedia = authMedia.filter((p) => p.visibility !== "public");
  const unlockedPaths = privateMedia
    .filter((p) => p.path)
    .map((p) => p.path as string);
  const signedUrls = await signPrivateMedia(supabase, unlockedPaths);

  return (
    <>
      {privateMedia.length ? (
        <>
          <p className="mp-priv-note">
            Photos et vidéos privées — réservées aux abonnés
          </p>
          <ul className="mp-grid mp-grid-locked">
            {privateMedia.slice(0, 12).map((p) => {
              const unlockedUrl = p.path ? signedUrls[p.path] : null;
              if (unlockedUrl) {
                // Abonné connecté et entitled sur ce média : vrai fichier, déverrouillé.
                return (
                  <li key={p.id} className={p.kind === "video" ? "mp-vidtile" : undefined}>
                    <a href={unlockedUrl} target="_blank" rel="noopener" aria-label={p.caption || `Contenu privé de ${m.name}`}>
                      {p.kind === "video" ? (
                        p.thumb_path ? (
                          <Image src={feedMediaUrl(p.thumb_path)} alt={p.caption || ""} width={300} height={400} unoptimized />
                        ) : (
                          <span className="mp-vid-fallback" aria-hidden="true" />
                        )
                      ) : (
                        <Image src={unlockedUrl} alt={p.caption || ""} width={300} height={400} unoptimized />
                      )}
                      {p.kind === "video" ? <span className="mp-vid" aria-hidden="true">▶</span> : null}
                    </a>
                  </li>
                );
              }
              // Anonyme ou non-abonné : aperçu sûr déjà flouté côté admin à l'upload
              // (thumb_path, bucket public) — jamais le fichier réel, jamais refloutée
              // en CSS ici.
              return (
                <li key={p.id} className="mp-locktile">
                  {p.thumb_path ? (
                    <Image src={feedMediaUrl(p.thumb_path)} alt="" width={300} height={400} unoptimized />
                  ) : (
                    <span className="mp-vid-fallback" aria-hidden="true" />
                  )}
                  <span className="mp-lock" aria-hidden="true">🔒</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mp-empty">Pas encore de contenu privé.</p>
      )}
      {unlockedPaths.length === 0 ? (
        <div className="mp-locked mp-locked-cta">
          <a href="/tarifs/" className="mp-sub-btn">
            S&apos;abonner pour accéder au contenu privé
          </a>
        </div>
      ) : null}
    </>
  );
}
