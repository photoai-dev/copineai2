import type { NextConfig } from "next";

// Alias stable du projet Vercel love20 (l'app actuelle : chat, compte, pass, paiements...).
// On n'utilise jamais l'URL d'un déploiement précis (elle change à chaque push) ni copineai.com
// (le domaine passe à ce projet-ci) — seulement cet alias fixe du projet.
const LEGACY_APP_ORIGIN = "https://love20-nine.vercel.app";

// Fichiers ET pages legacy à un seul segment (/blog, /app.css, /sw.js...) : un seul segment
// de chemin veut dire que notre route dynamique /[model] les avale AVANT le relais "fallback"
// vers love20 (elle matche n'importe quel segment unique, renvoie notFound() si ce n'est pas
// un id de modèle connu — cf doc Next.js, ordre de routage : dynamique = étape 7, avant
// "fallback" = étape 8). On les relaie explicitement en amont, via beforeFiles (étape 4).
const LEGACY_ROOT_FILES = ["app.css", "manifest.webmanifest", "sw.js"];
// Les pages statiques /blog/ de love20 (voir plus bas) chargent leur CSS via des
// chemins absolus /assets/*.css — sans ce relais, ces pages s'affichaient sans
// aucun style (menu invisible, pas cassé mais non stylé).
const LEGACY_ASSET_PREFIXES = ["assets", "img", "icons"];
// "blog" n'est PAS ici : il a son propre jeu de règles ci-dessous, pointant vers la version
// complète /app/blog/ (menus app), pas la version allégée /blog/ — demande explicite : le
// blog public doit être la vraie version, pas une version light. love20 exempte /app/blog/
// de son noindex global sur /app/* (vercel.json + robots.txt), donc elle reste indexable
// même affichée sur l'URL publique /blog/.
const LEGACY_ROOT_PAGES = [
  "faq", "guides", "lexique", "charte", "cgu",
  "confidentialite", "aide", "quiz", "alix", "compagnons", "pass",
];

const nextConfig: NextConfig = {
  // love20 force un "/" final sur toutes ses routes (vercel.json: trailingSlash=true) et
  // redirige (308) sinon. Sans ce même réglage ici, une requête sans slash final transite
  // par le fallback vers love20, qui répond par un 308 avec un Location relatif — le
  // navigateur le réinterprète sur CE domaine (copineai2), pas sur love20, d'où une boucle
  // de redirections infinie. En normalisant nous-mêmes le slash ici, en amont, cette requête
  // n'atteint jamais love20 sous une forme qui déclenche sa propre redirection.
  trailingSlash: true,
  async rewrites() {
    return {
      // Sans ça, ces 3 fichiers legacy à la racine (un seul segment, comme /sophie) sont
      // avalés par notre propre route dynamique /[model] (notFound(), puisqu'ils ne sont pas
      // un id de modèle connu) AVANT d'atteindre le relais "fallback" vers love20 — c'était la
      // cause du CSS manquant (page affichée sans aucun style). beforeFiles est évalué avant
      // les routes dynamiques (doc Next.js : ordre de routage, étape 4 vs étape 7).
      beforeFiles: [
        ...LEGACY_ROOT_FILES.map((f) => ({
          source: `/${f}`,
          destination: `${LEGACY_APP_ORIGIN}/${f}`,
        })),
        ...LEGACY_ASSET_PREFIXES.map((p) => ({
          source: `/${p}/:path*`,
          destination: `${LEGACY_APP_ORIGIN}/${p}/:path*`,
        })),
        // Le blog public (/blog/) relaie le vrai dossier /blog/ de love20 : 123
        // articles + 12 pages de catégorie en HTML STATIQUE pré-généré (pas la SPA
        // /app/blog/ en JS). Vrais <a href> partout, JSON-LD, canonical — c'est ce
        // contenu précis que Google a déjà indexé. Ne pas revenir sur ce choix sans
        // preuve contraire : /app/blog/ est la version JS, moins bonne pour le SEO.
        { source: "/blog/", destination: `${LEGACY_APP_ORIGIN}/blog/` },
        { source: "/blog/:path*/", destination: `${LEGACY_APP_ORIGIN}/blog/:path*/` },
        // Pages de vente (/vente/alma/ etc.) : même logique que le blog — on relaie
        // la vraie page vers /app/vente/..., que love20 exempte désormais de son
        // noindex global sur /app/* (vercel.json + robots.txt), pour qu'elle reste
        // indexable sur l'URL publique propre /vente/....
        { source: "/vente/:path*/", destination: `${LEGACY_APP_ORIGIN}/app/vente/:path*/` },
        ...LEGACY_ROOT_PAGES.flatMap((p) => [
          { source: `/${p}/`, destination: `${LEGACY_APP_ORIGIN}/${p}/` },
          { source: `/${p}/:path*/`, destination: `${LEGACY_APP_ORIGIN}/${p}/:path*/` },
        ]),
      ],
      afterFiles: [],
      // "fallback" : uniquement si aucune route Next.js (fichier, page statique ou dynamique)
      // ne correspond. /app/*, /_gestion/*, les anciennes pages non encore migrées (/pass,
      // /blog...) et les assets du SPA (photos, sw.js, manifest...) tombent ici et sont servis
      // par l'ancienne plateforme, inchangée, sur le même domaine.
      // Avec trailingSlash:true, Next exige le "/" final explicitement dans source ET
      // destination (doc Next.js : rewrites.md § "Rewriting to an external URL") — sans ça,
      // c'était la cause de la boucle de redirection (ERR_TOO_MANY_REDIRECTS).
      fallback: [
        { source: "/", destination: `${LEGACY_APP_ORIGIN}/` },
        { source: "/:path*/", destination: `${LEGACY_APP_ORIGIN}/:path*/` },
        // Fichiers (JS, CSS, images, manifest, service worker...) : jamais de slash final,
        // et trailingSlash:true les exempte déjà de toute redirection automatique (doc
        // Next.js : "Static file URLs, such as files with extensions" sont une exception) —
        // sans cette règle ils ne correspondaient à aucune des deux ci-dessus et tombaient
        // sur le 404 de Next au lieu d'être relayés vers love20 (page affichée sans styles).
        { source: "/:path*", destination: `${LEGACY_APP_ORIGIN}/:path*` },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "allbwtoexfxupksbvfnh.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
