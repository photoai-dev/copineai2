import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /app/* : l'app réelle (chat, compte, pass, paiements), proxiée vers l'ancienne plateforme —
    // jamais destinée à être indexée (chaque modèle a déjà sa page publique ici, en /<id>).
    rules: { userAgent: "*", allow: "/", disallow: "/app/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
