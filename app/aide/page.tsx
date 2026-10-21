import type { Metadata } from "next";
import { LegalArticle, LegalSection } from "@/components/LegalArticle";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Aide et contact | ${SITE_NAME}`,
  description: "Aide et contact — CopineAI.",
  alternates: { canonical: `${SITE_URL}/aide/` },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Puis-je résilier quand je veux ?",
    a: "Oui, en un clic depuis Mon compte. L'accès reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "Que voit-on sur mon relevé bancaire ?",
    a: "Un libellé neutre, sans le nom d'un modèle. Le libellé exact sera défini avec le prestataire de paiement.",
  },
  {
    q: "Les modèles sont-ils de vraies personnes ?",
    a: "Non : ce sont des âmes numériques, des intelligences artificielles. Leurs photos, voix et messages sont générés.",
  },
  {
    q: "Que retiennent-elles de moi ?",
    a: "Des souvenirs courts, que tu peux relire, corriger et supprimer dans l'onglet Mémoire. Tu peux aussi tout exporter ou effacer depuis Mon compte.",
  },
  {
    q: "Est-ce que l'on me met la pression pour payer ?",
    a: "Non. Aucun modèle ne culpabilise, n'insiste ni ne conditionne son affection à un achat.",
  },
  {
    q: "Et si je vais mal ?",
    a: "Le modèle sort du rôle et t'indique une aide réelle (3114 en France, 24 h/24). Les scores et défis ne remplacent jamais ta santé.",
  },
];

export default function AidePage() {
  return (
    <LegalArticle title="Aide et contact" crumb="Aide et contact">
      <div className="space-y-2">
        {FAQ.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-neutral-200 px-4 py-3"
          >
            <summary className="cursor-pointer list-none font-semibold text-neutral-900">
              {f.q}
            </summary>
            <p className="mt-2 leading-relaxed text-neutral-700">{f.a}</p>
          </details>
        ))}
      </div>
      <LegalSection h="Urgence">
        France : <b>3114</b> (prévention du suicide, 24 h/24), <b>112</b> ou{" "}
        <b>15</b> en cas de danger immédiat.
      </LegalSection>
      <LegalSection h="Nous écrire">
        Pour toute question, écris-nous à{" "}
        <a href="mailto:contact@copineai.com" className="underline">
          contact@copineai.com
        </a>
        . Si tu es déjà connecté(e), le formulaire de « Mon compte » répond plus
        vite.
      </LegalSection>
    </LegalArticle>
  );
}
