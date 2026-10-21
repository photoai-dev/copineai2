import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";
import { SiteHeader, SiteSidebar } from "@/components/SiteChrome";

// Pas de next/font/google ici : le site d'origine charge Bricolage Grotesque / Figtree en
// local (voir --display dans app.css de love20), et surtout ça évite de dépendre d'un accès
// réseau à fonts.googleapis.com au build. Polices système en attendant le self-host définitif.

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Des compagnes IA avec une vraie personnalité.",
};

// Header (menu du haut) + sidebar (menu de gauche) : même design, mêmes classes et
// couleurs que l'app (love20), repris dans components/SiteChrome.tsx — pour que
// chaque page de ce site (accueil, fiches, feed, tarifs, blog...) ait le même menu
// que le reste de la plateforme, pas un design différent par page. Ce sont de vrais
// <a href> rendus dans le HTML initial — pas un menu injecté en JS après coup comme
// sur love20 (boutons data-act, invisibles à Google) — ce qui fait circuler le
// maillage interne / "jus de lien" pour le SEO.

function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-neutral-500">
        <nav aria-label="Liens légaux">
          <ul className="flex flex-wrap gap-4">
            <li><a href="/">Accueil</a></li>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/guides/">Guides</a></li>
            <li><a href="/faq/">FAQ</a></li>
            <li><a href="/cgu/">CGU</a></li>
            <li><a href="/confidentialite/">Confidentialité</a></li>
            <li><a href="/charte/">Charte d&apos;utilisation</a></li>
            <li><a href="/aide/">Aide et contact</a></li>
          </ul>
        </nav>
        {/* Pas de new Date() ici : valeur non déterministe, interdite au prerender sous
            cacheComponents (cf. le même souci déjà rencontré sur le JSON-LD des fiches modèles). */}
        <p className="mt-4">© 2026 {SITE_NAME} — Des âmes numériques, réservé aux adultes.</p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <SiteSidebar />
        <SiteHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
