import type { MetadataRoute } from "next";
import { getAllModels } from "@/lib/models";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const models = getAllModels().map((m) => ({
    url: `${SITE_URL}/${m.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...models,
  ];
}
