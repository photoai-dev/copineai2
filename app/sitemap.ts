import type { MetadataRoute } from "next";
import { getAllModels } from "@/lib/models";
import { SITE_URL } from "@/lib/site";
import legacy from "@/lib/legacy-sitemap-data.json";

// Avant ce correctif, ce sitemap ne listait que la home + les 15 fiches modèles — une fois le
// domaine basculé sur ce projet (#107), il remplace celui de love20 à copineai.com/sitemap.xml,
// donc les 120 articles de blog + 12 catégories + 15 pages vente + pages statiques déjà indexés
// par Google doivent y rester. Snapshot pris sur le contenu love20 au 19/10/2026 (lib/legacy-
// sitemap-data.json) : à régénérer si de nouveaux articles/pages sont ajoutés côté love20.
const STATIC_PAGES = [
  "faq", "guides", "lexique", "charte", "cgu", "confidentialite", "aide",
  "quiz", "alix", "compagnons", "pass", "drague", "pourquoi-une-petite-amie-ia",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const models = getAllModels().map((m) => ({
    url: `${SITE_URL}/${m.id}/`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const vente = legacy.vente.map((slug) => ({
    url: `${SITE_URL}/vente/${slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const blog = legacy.blog.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  const blogCategories = legacy.blogCategories.map((slug) => ({
    url: `${SITE_URL}/blog/categorie/${slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));
  const staticPages = STATIC_PAGES.map((slug) => ({
    url: `${SITE_URL}/${slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/blog/`, changeFrequency: "daily", priority: 0.7 },
    ...models,
    ...vente,
    ...blog,
    ...blogCategories,
    ...staticPages,
  ];
}
