import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Avant ce correctif, seul "/app/" était disallow ici — une fois le domaine basculé (#107),
// ces règles remplacent celles de love20 à copineai.com/robots.txt. L'ancien robots.txt de
// love20 interdisait aussi /compte/, /pass/, /webmaster/, /timeline/, /drague/, /generate/,
// /mine/, /me/, /pay/, /studio/ (comptes, paiements, pages partenaires/privées) — sans les
// reprendre ici, ces pages redeviendraient explorables après la bascule. /feed/ et /blog/ ne
// sont PAS repris dans cette liste : page publique indexable intentionnelle côté copineai2
// (contrairement à l'ancien /feed/ de love20, qui était un alias de l'app).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app/",
        "/compte/",
        "/pass/",
        "/webmaster/",
        "/timeline/",
        "/drague/",
        "/generate/",
        "/mine/",
        "/me/",
        "/pay/",
        "/studio/",
        "/_gestion/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
