import type { NextConfig } from "next";

// Alias stable du projet Vercel love20 (l'app actuelle : chat, compte, pass, paiements...).
// On n'utilise jamais l'URL d'un déploiement précis (elle change à chaque push) ni copineai.com
// (le domaine passe à ce projet-ci) — seulement cet alias fixe du projet.
const LEGACY_APP_ORIGIN = "https://love20-nine.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // "fallback" : uniquement si aucune route Next.js (fichier, page statique ou dynamique)
      // ne correspond. /app/*, /_gestion/*, les anciennes pages non encore migrées (/pass,
      // /blog...) et les assets du SPA (photos, sw.js, manifest...) tombent ici et sont servis
      // par l'ancienne plateforme, inchangée, sur le même domaine.
      fallback: [
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
