import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

// Pas de next/font/google ici : le site d'origine charge Bricolage Grotesque / Figtree en
// local (voir --display dans app.css de love20), et surtout ça évite de dépendre d'un accès
// réseau à fonts.googleapis.com au build. Polices système en attendant le self-host définitif.

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Des compagnes IA avec une vraie personnalité.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
