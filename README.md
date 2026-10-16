# CopineAI — pages publiques (Next.js)

Possède les URLs publiques indexables de copineai.com : accueil et fiches modèles
(`/sophie`, `/jessica`...), en SSG via `generateStaticParams`.

Tout le reste (chat, compte, Pass, paiements, admin `_gestion`) continue d'être
servi par le projet `love20` existant, sous `/app/*`, via le rewrite `fallback`
de `next.config.ts` — un seul domaine, deux projets Vercel.

- `lib/models.ts` : données modèles (extraites du registre `MODELS` de love20,
  champs publics uniquement — jamais `persona`/`canon`)
- `app/[model]/page.tsx` : fiche modèle (SSG + meta + schema.org)
- `app/sitemap.ts`, `app/robots.ts` : indexation (`/app/` explicitement exclu)
