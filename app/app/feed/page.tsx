import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getAccountOverview } from "@/app/actions/account";
import { supabaseServer } from "@/lib/supabase/server";
import { getMemberFeed, feedMediaUrl, type MemberFeedPost } from "@/lib/feed";
import { getModel } from "@/lib/models";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Feed — ${SITE_NAME}` };
export const instant = false;

// Vrai feed membre (08/11/2026, #127) : remplace la grille plate (toutes les publications
// mélangées, sans distinction) par les 3 filtres de love20 — Public / Privé / Bloqué —
// avec un vrai verrou "Pass requis" sur le privé (selon le forfait réel du membre, lu via
// getAccountOverview) et un vrai verrou prix sur le "ppv" (déblocage par crédit : pas encore
// construit côté paiement, donc ces posts restent verrouillés pour tout le monde pour
// l'instant — pas de "séries" : cette notion n'existe dans aucune colonne de la table
// posts côté base, seulement dans le rendu JS de l'ancienne SPA ; on ne fabrique pas une
// donnée qui n'existe pas).
const PRIV_PLANS = new Set(["Plus", "VIP", "VIP Élite"]);

function Lock({ label, href, cta }: { label: string; href: string; cta: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 p-3 text-center text-white">
      <span className="text-xs font-semibold">{label}</span>
      <Link
        href={href}
        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900"
      >
        {cta}
      </Link>
    </div>
  );
}

function Tile({ p, locked, lock }: { p: MemberFeedPost; locked: boolean; lock?: React.ReactNode }) {
  const m = getModel(p.model_id);
  const alt = p.caption?.trim() || (m ? `Photo de ${m.name}` : "Photo");
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
      {p.kind === "video" ? (
        <video
          src={feedMediaUrl(p.media)}
          poster={p.poster ? feedMediaUrl(p.poster) : undefined}
          className={`h-full w-full object-cover ${locked ? "blur-md scale-110" : ""}`}
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        <Image
          src={feedMediaUrl(p.media)}
          alt={alt}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className={`object-cover ${locked ? "blur-md scale-110" : ""}`}
        />
      )}
      {locked ? (
        lock
      ) : m ? (
        <Link
          href={`/${m.id}/`}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          {m.name}
        </Link>
      ) : null}
    </div>
  );
}

export default async function MemberFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  const supabase = await supabaseServer();
  const [posts, overview] = await Promise.all([getMemberFeed(supabase, 90), getAccountOverview()]);
  const hasPrivAccess = PRIV_PLANS.has(overview?.plan ?? "Gratuit");

  const pub = posts.filter((p) => p.access === "pub");
  const priv = posts.filter((p) => p.access === "priv");
  const ppv = posts.filter((p) => p.access === "ppv");

  const { f } = await searchParams;
  const tab = f === "priv" || f === "bloque" ? f : "pub";

  const tabs: { id: string; label: string; count: number }[] = [
    { id: "pub", label: "Public", count: pub.length },
    { id: "priv", label: "Privé", count: priv.length },
    { id: "bloque", label: "Bloqué", count: ppv.length },
  ];

  const shown = tab === "priv" ? priv : tab === "bloque" ? ppv : pub;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Ton feed</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Toutes les photos et vidéos de tes copines, triées par accès — comme sur leur fiche.
      </p>

      <nav className="mt-5 flex gap-1 rounded-full bg-neutral-100 p-1 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.id === "pub" ? "/app/feed/" : `/app/feed/?f=${t.id}`}
            className={`flex-1 rounded-full px-3 py-1.5 text-center font-semibold ${
              tab === t.id ? "bg-white shadow-sm" : "text-neutral-500"
            }`}
          >
            {t.label} <span className="text-neutral-400">({t.count})</span>
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-10 text-sm text-neutral-500">Rien à afficher pour le moment.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {shown.map((p) => {
            if (tab === "priv" && !hasPrivAccess) {
              return (
                <Tile
                  key={p.id}
                  p={p}
                  locked
                  lock={
                    <Lock
                      label={`Pass requis — forfait ${overview?.plan ?? "Gratuit"}`}
                      href="/tarifs/"
                      cta="S'abonner"
                    />
                  }
                />
              );
            }
            if (tab === "bloque") {
              const price = p.price_cents != null ? `${(p.price_cents / 100).toFixed(2)} €` : "";
              return (
                <Tile
                  key={p.id}
                  p={p}
                  locked
                  lock={<Lock label={`À débloquer${price ? ` · ${price}` : ""}`} href="/tarifs/" cta="Débloquer" />}
                />
              );
            }
            return <Tile key={p.id} p={p} locked={false} />;
          })}
        </div>
      )}
    </main>
  );
}
