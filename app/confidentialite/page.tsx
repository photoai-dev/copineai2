import type { Metadata } from "next";
import { LegalArticle, LegalSection } from "@/components/LegalArticle";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Politique de confidentialité | ${SITE_NAME}`,
  description: "Politique de confidentialité — CopineAI.",
  alternates: { canonical: `${SITE_URL}/confidentialite/` },
};

export default function ConfidentialitePage() {
  return (
    <LegalArticle
      title="Politique de confidentialité"
      crumb="Politique de confidentialité"
      note="Projet de texte, à faire valider. Responsable du traitement : [Raison sociale]."
    >
      <LegalSection h="Données traitées">
        Adresse e-mail, pseudo, forfait, conversations avec les modèles, souvenirs
        générés, scores, programmes et préférences de notification.
      </LegalSection>
      <LegalSection h="Finalités">
        Fournir le service, personnaliser les réponses, sécuriser la plateforme,
        facturer. Aucune vente de données. Aucun profilage publicitaire.
      </LegalSection>
      <LegalSection h="Mémoire des modèles">
        Les souvenirs sont visibles, modifiables et supprimables à tout moment dans
        l&apos;onglet Mémoire.
      </LegalSection>
      <LegalSection h="Tes droits">
        Accès, rectification, export (portabilité), effacement, opposition. Dans «
        Mon compte », l&apos;export et la suppression totale sont disponibles en un
        clic. Contact : contact@copineai.com.
      </LegalSection>
      <LegalSection h="Sous-traitants">
        Hébergement, fournisseur de modèles de langage, prestataire de paiement,
        envoi d&apos;e-mails. [Liste et pays à compléter.]
      </LegalSection>
      <LegalSection h="Conservation">
        Conversations : jusqu&apos;à suppression par l&apos;utilisateur ou clôture du
        compte, puis effacement sous 30 jours.
      </LegalSection>
    </LegalArticle>
  );
}
