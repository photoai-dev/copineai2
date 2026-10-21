import type { Metadata } from "next";
import { LegalArticle, LegalSection } from "@/components/LegalArticle";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Charte de contenu et d'IA | ${SITE_NAME}`,
  description: "Charte de contenu et d'IA — CopineAI.",
  alternates: { canonical: `${SITE_URL}/charte/` },
};

export default function ChartePage() {
  return (
    <LegalArticle title="Charte de contenu et d'IA" crumb="Charte de contenu et d'IA">
      <LegalSection h="Ce que sont les modèles">
        Des âmes numériques : intelligences artificielles. Leurs photos, voix et
        messages sont générés. Leur personnalité est écrite, cohérente et sans
        promesse de rencontre réelle.
      </LegalSection>
      <LegalSection h="Ce que nous faisons">
        Contenus sensuels ou taquins, jamais explicites. Adultes uniquement,
        consentement toujours présent. Aucune pression pour dépenser, aucune
        culpabilisation.
      </LegalSection>
      <LegalSection h="Ce que nous refusons">
        Mineurs, contrainte, violence, exigence d&apos;argent ou de cadeaux,
        humiliation publique, mise en danger de la santé.
      </LegalSection>
      <LegalSection h="Jeux de rôle">
        Pour les modèles à univers fort (Natasha, Liloo), le jeu reste un jeu : un
        mot de sécurité (« pause ») fait sortir du personnage immédiatement.
      </LegalSection>
      <LegalSection h="En cas de détresse">
        Le modèle sort du rôle et oriente vers une aide réelle.
      </LegalSection>
    </LegalArticle>
  );
}
