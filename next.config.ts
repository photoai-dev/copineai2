import type { NextConfig } from "next";

// Alias stable du projet Vercel love20 (l'app actuelle : chat, compte, pass, paiements...).
// On n'utilise jamais l'URL d'un déploiement précis (elle change à chaque push) ni copineai.com
// (le domaine passe à ce projet-ci) — seulement cet alias fixe du projet.
const LEGACY_APP_ORIGIN = "https://love20-nine.vercel.app";

// Fichiers ET pages legacy à un seul segment (/blog, /app.css...) : un seul segment
// de chemin veut dire que notre route dynamique /[model] les avale AVANT le relais "fallback"
// vers love20 (elle matche n'importe quel segment unique, renvoie notFound() si ce n'est pas
// un id de modèle connu — cf doc Next.js, ordre de routage : dynamique = étape 7, avant
// "fallback" = étape 8). On les relaie explicitement en amont, via beforeFiles (étape 4).
// "sw.js" n'est PLUS relayé vers love20 (#110) : les navigateurs qui ont visité le
// site avant la bascule du domaine ont encore l'ancien service worker de love20
// enregistré et actif sur www.copineai.com — il intercepte les navigations et sert
// parfois une page "/" en cache (vieille version), d'où "2 pages d'accueil différentes"
// selon qu'on arrive en direct ou qu'on revient en arrière. On sert désormais NOTRE
// propre /sw.js (public/sw.js), un "kill switch" qui se désenregistre lui-même et
// vide le cache dès qu'un de ces navigateurs revérifie le service worker.
const LEGACY_ROOT_FILES = ["app.css", "manifest.webmanifest"];
// Les pages statiques /blog/ de love20 (voir plus bas) chargent leur CSS via des
// chemins absolus /assets/*.css — sans ce relais, ces pages s'affichaient sans
// aucun style (menu invisible, pas cassé mais non stylé).
const LEGACY_ASSET_PREFIXES = ["assets", "img", "icons"];
// Fiches modèle (#108, 20/10/2026 → #113, 21/10/2026 → #121, 21/10/2026) : le relais vers
// love20 avait été retiré en #113 en pensant que app/[model]/page.tsx (bio, traits, aperçu
// feed, CTA, JSON-LD) suffisait. FAUX : love20 affiche un vrai profil membre (bannière, avatar,
// stats publications/vidéos/souvenirs, boutons "S'abonner"/"Message", humeur, forfait/crédits,
// grille de miniatures) — notre page est une coquille à côté (cf captures utilisateur, #121).
// Même logique que /feed/ (#117) et /app/* (#118) : on relaie vers la vraie version plutôt que
// de maintenir une version "light" en parallèle. Limite : love20 a son propre jeu de données
// figé (gelé, non redéployé) et ne connaît PAS "libertine" (Kim & Anaïs, modèle ajouté le
// 20/10/2026 après ce gel — cf lib/models.ts) : la relayer donnerait la même page générique
// "Cette présentation arrive bientôt" que /app/vente/libertine/. Donc la liste ci-dessous est
// explicite (tous les ids de MODEL_ORDER sauf "libertine"), pas "tout sauf la liste noire" —
// pour que tout nouveau modèle futur, absent de love20 par construction, continue de tomber sur
// notre propre app/[model]/page.tsx (route dynamique, étape 7) plutôt que sur un relais cassé.
const LEGACY_MODEL_IDS = [
  "sophie", "jessica", "jenny", "anna", "nina", "liloo", "natasha", "lee",
  "alma", "olivia", "annabelle", "cindy", "ayo", "nabilla", "charlotte",
  "beatrice", "aya", "capucine",
];
// "blog" n'est PAS ici : il a son propre jeu de règles ci-dessous, pointant vers la version
// complète /app/blog/ (menus app), pas la version allégée /blog/ — demande explicite : le
// blog public doit être la vraie version, pas une version light. love20 exempte /app/blog/
// de son noindex global sur /app/* (vercel.json + robots.txt), donc elle reste indexable
// même affichée sur l'URL publique /blog/.
// cgu/confidentialite/charte/aide : migrées vers de vraies pages Next.js (#112).
// compagnons (+ ses 5 sous-pages /compagnons/<id>/) : migré de même (#112).
// Retirés d'ici.
const LEGACY_ROOT_PAGES = [
  "faq", "guides", "lexique",
  "quiz", "alix", "pass",
  // Ajoutés : liens présents dans le menu de love20 (index.html) mais absents de cette
  // liste jusqu'ici, donc avalés en 404 par notre route dynamique /[model] (même cause
  // que le blog à l'origine — cf commentaire plus haut) au lieu d'être relayés.
  "drague", "timeline", "webmaster", "pourquoi-une-petite-amie-ia", "live", "compte",
  // Critique avant la bascule du domaine (#107) : "/_gestion/" (entrée de l'admin, un seul
  // segment) tombait dans le même piège — avalée en 404 par /[model] au lieu d'atteindre
  // love20. Les sous-pages (/_gestion/vivix/ etc., 2+ segments) ne matchent pas /[model] et
  // n'avaient donc pas besoin de cette règle. _gestion reste gelé (non modifié), seule la
  // route d'accès est corrigée ici.
  "_gestion",
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
        // Feed public (#117, 21/10/2026) : même logique que le blog et vente — notre
        // propre app/feed/page.tsx était une version "allégée" (grille simple, sans
        // filtres, sans aperçus privés verrouillés) alors que love20 a le vrai feed
        // (679 posts, filtres public/privé/séries, cartes verrouillées "Pass requis").
        // Le client doit voir CE feed-là dès la première visite sur l'URL publique
        // /feed/, pas une maquette différente. Relais direct vers /app/feed/.
        { source: "/feed/", destination: `${LEGACY_APP_ORIGIN}/app/feed/` },
        // Fiches modèle connues de love20 (#121, 21/10/2026) : voir le commentaire sur
        // LEGACY_MODEL_IDS plus haut. "libertine" est volontairement absent de cette liste.
        ...LEGACY_MODEL_IDS.map((id) => ({
          source: `/${id}/`,
          destination: `${LEGACY_APP_ORIGIN}/${id}/`,
        })),
        // TOUT /app/* (#118, 21/10/2026) : nos propres pages app/app/{feed,me,mine,
        // generate,live,compte}/page.tsx (tâche #104) étaient des réimplémentations
        // partielles — sans les filtres, compteurs, cartes "Pass requis" de love20 —
        // qui n'interceptaient QUE la navigation directe/rafraîchissement (une page
        // vue/chargée côté serveur Next.js gagne contre le fallback). Qui naviguait
        // depuis l'intérieur de love20 (SPA, routage client) voyait la vraie version;
        // qui arrivait directement sur l'URL voyait notre version allégée — incohérence
        // selon le point d'entrée. Un seul relais générique règle tout, présent et
        // futur, au lieu d'une liste au cas par cas : love20 reste l'unique source pour
        // /app/* tant que nos pages ne sont pas à parité. (Session partagée : même
        // domaine, même projet Supabase — pas de perte de connexion en traversant.)
        { source: "/app/", destination: `${LEGACY_APP_ORIGIN}/app/` },
        { source: "/app/:path*/", destination: `${LEGACY_APP_ORIGIN}/app/:path*/` },
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
  // Sans ça, les pages relayées depuis love20 (fallback ci-dessus : "/", /vente/*, /live/
  // avant correction, etc.) restaient figées en cache côté edge Vercel — un contenu mis à
  // jour sur love20 (ou en base, via les pages qui en dépendent) n'était jamais revu tant
  // qu'aucun nouveau déploiement de CE projet ne force une entrée de cache différente.
  // Diagnostiqué le 19/10/2026 : "/app/live/" corrigé sur love20 restait absent de "/" servi
  // via copineai2 des heures après, confirmé par un fetch direct sur love20 (à jour) vs un
  // fetch via copineai2 (figé). Contrepartie acceptée : nos propres pages statiques (/feed/,
  // /[model]/...) perdent aussi la mise en cache HTTP en bénéficiaient — correct avant perf,
  // à revoir plus finement une fois la bascule de domaine (#107) stabilisée.
  async headers() {
    return [
      { source: "/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
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
