"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { feedMediaUrl } from "@/lib/media-url";
import { supabaseBrowser } from "@/lib/supabase/client";

type GalleryItem = {
  id: string;
  path: string;
  thumb_path: string | null;
  caption: string | null;
};

// Popup Photos/Vidéos (10/11/2026) : avant, chaque vignette était un <a href> qui ouvrait
// le fichier media-public directement dans un nouvel onglet — aucune navigation, et tout
// le contenu public était accessible sans compte. Demande explicite : une vraie popup avec
// précédent/suivant, seulement 5 photos en grand pour un visiteur anonyme (au-delà →
// inscription/connexion), et les vidéos publiques toujours réservées aux connectés (la
// vignette reste visible pour tous, seule la lecture est verrouillée). On vérifie la vraie
// session (même cookie que le serveur, via supabaseBrowser) plutôt que de deviner.
function useSession() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    let active = true;
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        if (active) setLoggedIn(!!data.session);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return loggedIn;
}

function Lightbox({
  items,
  index,
  onClose,
  onNav,
  locked,
  gateText,
  renderUnlocked,
  ariaLabel,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNav: (delta: number) => void;
  locked: boolean;
  gateText: string;
  renderUnlocked: (item: GalleryItem) => React.ReactNode;
  ariaLabel: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav(-1);
      if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);

  const item = items[index];
  return (
    <div className="mp-lightbox" role="dialog" aria-modal="true" aria-label={ariaLabel} onClick={onClose}>
      <button type="button" className="mp-lb-close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            className="mp-lb-nav mp-lb-prev"
            onClick={(e) => {
              e.stopPropagation();
              onNav(-1);
            }}
            aria-label="Précédent"
          >
            ‹
          </button>
          <button
            type="button"
            className="mp-lb-nav mp-lb-next"
            onClick={(e) => {
              e.stopPropagation();
              onNav(1);
            }}
            aria-label="Suivant"
          >
            ›
          </button>
        </>
      ) : null}
      <div className="mp-lb-stage" onClick={(e) => e.stopPropagation()}>
        {locked ? (
          <div className="mp-lb-gate">
            <p>{gateText}</p>
            <a href="/compte/" className="mp-sub-btn">
              S&apos;inscrire / Se connecter
            </a>
          </div>
        ) : (
          renderUnlocked(item)
        )}
      </div>
    </div>
  );
}

const FREE_PHOTOS = 5;

export function PhotoGallery({ images, modelName }: { images: GalleryItem[]; modelName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const loggedIn = useSession();

  if (!images.length) return <p className="mp-empty">Pas encore de photo publique.</p>;

  const nav = (delta: number) =>
    setOpenIndex((i) => (i === null ? null : (i + delta + images.length) % images.length));

  return (
    <>
      <ul className="mp-grid">
        {images.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="mp-grid-btn"
              onClick={() => setOpenIndex(i)}
              aria-label={p.caption || `Photo de ${modelName}, agrandir`}
            >
              <Image src={feedMediaUrl(p.path)} alt={p.caption || `Photo de ${modelName}`} width={300} height={400} unoptimized />
            </button>
          </li>
        ))}
      </ul>
      {openIndex !== null ? (
        <Lightbox
          items={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNav={nav}
          locked={!loggedIn && openIndex >= FREE_PHOTOS}
          gateText={`Crée un compte ou connecte-toi pour voir la suite des photos de ${modelName}.`}
          ariaLabel={`Photo de ${modelName}`}
          renderUnlocked={(item) => (
            <Image
              src={feedMediaUrl(item.path)}
              alt={item.caption || `Photo de ${modelName}`}
              width={900}
              height={1200}
              unoptimized
              className="mp-lb-img"
            />
          )}
        />
      ) : null}
    </>
  );
}

export function VideoGallery({ videos, modelName }: { videos: GalleryItem[]; modelName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const loggedIn = useSession();

  if (!videos.length) return <p className="mp-empty">Pas encore de vidéo publique.</p>;

  const nav = (delta: number) =>
    setOpenIndex((i) => (i === null ? null : (i + delta + videos.length) % videos.length));

  return (
    <>
      <ul className="mp-grid">
        {videos.map((p, i) => (
          <li key={p.id} className="mp-vidtile">
            <button
              type="button"
              className="mp-grid-btn"
              onClick={() => setOpenIndex(i)}
              aria-label={p.caption || `Vidéo de ${modelName}, lire`}
            >
              {p.thumb_path ? (
                <Image src={feedMediaUrl(p.thumb_path)} alt={p.caption || `Vidéo de ${modelName}`} width={300} height={400} unoptimized />
              ) : (
                <span className="mp-vid-fallback" aria-hidden="true" />
              )}
              <span className="mp-vid" aria-hidden="true">
                ▶
              </span>
            </button>
          </li>
        ))}
      </ul>
      {openIndex !== null ? (
        <Lightbox
          items={videos}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNav={nav}
          locked={!loggedIn}
          gateText={`Connecte-toi pour regarder les vidéos de ${modelName}.`}
          ariaLabel={`Vidéo de ${modelName}`}
          renderUnlocked={(item) => (
            <video key={item.id} src={feedMediaUrl(item.path)} controls autoPlay className="mp-lb-video" />
          )}
        />
      ) : null}
    </>
  );
}
