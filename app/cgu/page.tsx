import type { Metadata } from "next";
import { LegalArticle, LegalSection } from "@/components/LegalArticle";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Conditions générales d'utilisation | ${SITE_NAME}`,
  description: "Conditions générales d'utilisation — CopineAI.",
  alternates: { canonical: `${SITE_URL}/cgu/` },
};

export default function CguPage() {
  return (
    <LegalArticle
      title="Conditions générales d'utilisation"
      crumb="Conditions générales d'utilisation"
      note="Projet de texte, à faire valider par un juriste avant tout lancement. [Raison sociale] · [Adresse] · [SIREN]"
    >
      <LegalSection h="1. Objet">
        CopineAI est un service de conversations et de contenus avec des
        intelligences artificielles, appelées « âmes numériques ». Elles ne sont pas
        des personnes réelles.
      </LegalSection>
      <LegalSection h="2. Accès">
        Le service est réservé aux personnes majeures. L&apos;utilisateur déclare
        avoir 18 ans révolus et fournit, en production, une vérification d&apos;âge.
        Tout compte suspecté d&apos;appartenir à un mineur est fermé.
      </LegalSection>
      <LegalSection h="3. Abonnements et paiement">
        Les forfaits sont facturés à l&apos;avance, mensuellement ou annuellement. La
        résiliation est possible à tout moment depuis « Mon compte » et prend effet à
        la fin de la période payée. [Mentions de rétractation et de remboursement à
        compléter.]
      </LegalSection>
      <LegalSection h="4. Règles d'usage">
        Sont interdits : les propos visant des mineurs, la haine, la violence, les
        tentatives d&apos;obtenir des contenus explicites, l&apos;usurpation
        d&apos;identité, l&apos;extraction massive des contenus. Nous pouvons
        suspendre un compte en cas d&apos;abus.
      </LegalSection>
      <LegalSection h="5. Nature du service">
        Le service ne remplace ni un professionnel de santé, ni un conseil financier
        ou juridique. Les programmes de sport et de nutrition sont indicatifs ;
        consulte un médecin avant de commencer.
      </LegalSection>
      <LegalSection h="6. Propriété">
        Les contenus sont protégés. Aucune copie, revente ni entraînement de modèles
        à partir des contenus n&apos;est autorisé.
      </LegalSection>
      <LegalSection h="7. Responsabilité et droit applicable">
        [À compléter] · Droit français.
      </LegalSection>
    </LegalArticle>
  );
}
