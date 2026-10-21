import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Page tarifs publique — reprend les vrais niveaux définis dans l'app (objet TIERS,
// index.html de love20) : aucun prix inventé. Les forfaits par modèle (Gratuit, Plus,
// VIP, VIP Élite) ne sont pas achetables ici (l'app gère les paiements, sous /app/pay/,
// non public) — cette page est une vitrine, le passage à l'achat se fait dans l'app.

export const metadata: Metadata = {
  title: `Tarifs — nos forfaits | ${SITE_NAME}`,
  description:
    "Les forfaits CopineAI : Gratuit, Plus, VIP, VIP Élite par modèle, ou le Pass CopineAI pour toutes les compagnes.",
  alternates: { canonical: `${SITE_URL}/tarifs/` },
};

type Tier = {
  name: string;
  price: string;
  features: string[];
};

const PER_MODEL_TIERS: Tier[] = [
  { name: "Gratuit", price: "0 €", features: ["10 messages de chat par jour"] },
  {
    name: "Plus",
    price: "14,99 €/mois",
    features: ["Chat illimité", "Feed privé de la modèle"],
  },
  {
    name: "VIP",
    price: "39,99 €/mois",
    features: [
      "Chat illimité",
      "Feed privé de la modèle",
      "Espace VIP : coffre, vidéos, audios",
      "WhatsApp, Telegram et envois programmés",
      "4 photos à la demande par mois",
    ],
  },
  {
    name: "VIP Élite",
    price: "89,99 €/mois",
    features: [
      "Tout le niveau VIP",
      "15 photos à la demande par mois",
      "Quota doublé et envois quotidiens",
    ],
  },
];

export default function TarifsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <nav className="mb-6 text-sm text-neutral-500">
        <a href="/">Accueil</a> <span>›</span> <span>Tarifs</span>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Nos forfaits
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Chaque compagne a ses propres niveaux d&apos;accès, du gratuit au VIP
        Élite. Le Pass CopineAI donne l&apos;équivalent du niveau Plus sur
        toutes les compagnes, pour un seul abonnement.
      </p>

      <section className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Pass CopineAI</h2>
        <p className="mt-1 text-3xl font-extrabold">59,99 €<span className="text-base font-medium text-neutral-500">/mois</span></p>
        <p className="mt-3 max-w-xl text-neutral-600">
          Accès au feed privé et au chat étendu de toutes les compagnes. Les
          options VIP (WhatsApp, Telegram, photos à la demande) restent
          proposées par compagne.
        </p>
      </section>

      <h2 className="mt-12 text-xl font-bold">Par compagne</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PER_MODEL_TIERS.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border border-neutral-200 p-5"
          >
            <h3 className="font-bold">{t.name}</h3>
            <p className="mt-1 text-xl font-extrabold">{t.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {t.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-neutral-500">
        Les tarifs affichés sont indicatifs tant que le service n&apos;est
        pas ouvert au public.
      </p>
    </div>
  );
}
