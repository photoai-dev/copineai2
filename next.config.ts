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
// Fiches modèle (#108, 20/10/2026 → #113 → #121 → #122 → #123, 22/10/2026) : relayées vers
// love20 un temps (#121/#122) pour avoir son menu et sa mise en page complète, mais love20 est
// gelé (jamais redéployé) et ne lit pas la table posts — son contenu date de la snapshot du
// 08/10 (ex. Lee : 27 anciennes photos en dur au lieu de ses 121 posts actuels gérés depuis
// l'admin). app/[model]/page.tsx a maintenant sa propre vraie mise en page (bannière, stats,
// onglets Public/Privé/Bloqué) qui lit Supabase EN DIRECT (lib/feed.ts, getModelFeed) : plus
// besoin de relais, pour aucun modèle, y compris "libertine" (Kim & Anaïs). Les routes
// dynamiques gagnent déjà contre le fallback (étape 7 avant 8), donc rien à ajouter ici.
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
        // Pages de vente (/vente/alma/ etc.) : RETIRÉ (08/11/2026) — c'était exactement
        // la duplication "profil light vs vraie version" que le client a signalée (deux
        // pages différentes pour le même modèle selon le point d'entrée : /vente/<id>/
        // relayé vers la SPA love20, /<id>/ sur notre vraie page Supabase). app/[model]/
        // page.tsx est maintenant l'unique fiche modèle ; /vente/<id>/ redirige vers elle
        // (redirects() ci-dessous), une seule URL, un seul contenu, plus de relais.
        // Feed public (#117, 21/10/2026) : même logique que le blog et vente — notre
        // propre app/feed/page.tsx était une version "allégée" (grille simple, sans
        // filtres, sans aperçus privés verrouillés) alors que love20 a le vrai feed
        // (679 posts, filtres public/privé/séries, cartes verrouillées "Pass requis").
        // Le client doit voir CE feed-là dès la première visite sur l'URL publique
        // /feed/, pas une maquette différente. Relais direct vers /app/feed/.
        { source: "/feed/", destination: `${LEGACY_APP_ORIGIN}/app/feed/` },
        // Fiches modèle (#121 → #122 → #123) : plus de relais vers love20, voir le commentaire
        // plus haut. app/[model]/page.tsx (route dynamique) sert maintenant toutes les fiches,
        // avec son propre contenu en direct depuis Supabase.
        // TOUT /app/* SAUF /app/me/ (#118, 21/10/2026 → #126, 08/11/2026) : nos propres pages
        // app/app/{feed,mine,generate,live,compte}/page.tsx (tâche #104) étaient des
        // réimplémentations partielles — sans les filtres, compteurs, cartes "Pass requis" de
        // love20 — qui n'interceptaient QUE la navigation directe/rafraîchissement (une page
        // vue/chargée côté serveur Next.js gagne contre le fallback). Qui naviguait
        // depuis l'intérieur de love20 (SPA, routage client) voyait la vraie version;
        // qui arrivait directement sur l'URL voyait notre version allégée — incohérence
        // selon le point d'entrée. Un seul relais générique règle tout, présent et
        // futur, au lieu d'une liste au cas par cas : love20 reste l'unique source pour
        // /app/* tant que nos pages ne sont pas à parité. (Session partagée : même
        // domaine, même projet Supabase — pas de perte de connexion en traversant.)
        // /app/me/ (chat) est maintenant à parité (galerie média, mode sexy, rendu
        // photo/vidéo) et doit rester sur NOTRE page (app/app/me/page.tsx), pas celle de
        // love20 — sans quoi tout visiteur de /app/me/ retombait sur l'ancienne messagerie
        // SPA de love20, qui ignore les évolutions récentes côté chat.
        // Essayé d'abord : une règle séparée AVANT la générique, qui se "rewrite" vers
        // elle-même (même chemin en destination). Ça ne marche PAS — Next.js reconnaît une
        // destination identique au chemin demandé comme un no-op et continue d'évaluer les
        // règles suivantes, qui relaient quand même vers love20 (vu en local : tentative de
        // proxy vers love20-nine malgré cette règle). La bonne approche : exclure "me" du
        // paramètre capturé par la règle générique elle-même, via une regex à négation
        // (path-to-regexp, doc Next.js : "Regex Path Matching"). "(?!me/?$).*" refuse
        // uniquement le segment EXACT "me" (donc "mine", "me/quelquechose" restent relayés
        // normalement vers love20, seul "/app/me/" exact en est exclu et retombe sur le
        // routage fichier/page normal de Next, qui sert notre app/app/me/page.tsx).
        { source: "/app/", destination: `${LEGACY_APP_ORIGIN}/app/` },
        { source: "/app/:path((?!me/?$).*)/", destination: `${LEGACY_APP_ORIGIN}/app/:path/` },
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
  // /vente/<id>/ existait en double de la vraie fiche modèle /<id>/ (voir commentaire
  // retiré ci-dessus) — redirect() est résolu avant rewrites() (doc Next.js : ordre de
  // routage), donc cette redirection intercepte avant que /vente/* ne puisse retomber
  // dans le fallback générique vers love20. 308 permanent : anciens liens/indexation Google
  // vers /vente/<id>/ doivent transférer leur jus SEO vers la seule URL canonique.
  async redirects() {
    return [{ source: "/vente/:model/", destination: "/:model/", permanent: true }];
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
