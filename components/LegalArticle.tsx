import type { ReactNode } from "react";

// Gabarit partagé pour les pages légales/aide (CGU, Confidentialité, Charte, Aide) —
// contenu porté depuis love20 (/cgu/, /confidentialite/, /charte/, /aide/), mis en
// page avec les classes Tailwind déjà utilisées par /feed/ et /tarifs/ plutôt que les
// classes .po/.sx-* de love20 (évite de porter une CSS bespoke pour 4 pages de texte).

export function LegalArticle({
  title,
  crumb,
  note,
  children,
}: {
  title: string;
  crumb: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm text-neutral-500">
        <a href="/">Accueil</a> <span>›</span> <span>{crumb}</span>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      {note && (
        <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {note}
        </p>
      )}
      <div className="mt-6 space-y-6">{children}</div>
      <p className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
        Une question ? Écris-nous à{" "}
        <a href="mailto:contact@copineai.com" className="underline">
          contact@copineai.com
        </a>
        .
      </p>
    </div>
  );
}

export function LegalSection({ h, children }: { h: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold tracking-tight">{h}</h2>
      <p className="mt-1.5 leading-relaxed text-neutral-700">{children}</p>
    </section>
  );
}
