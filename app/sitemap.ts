import type { MetadataRoute } from "next";
import { getStore } from "@/lib/db/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const store = await getStore();
  const spots = await store.getSpots();

  return [
    {
      url: base,
      changeFrequency: "daily",
      priority: 1,
    },
    ...spots.map((s) => ({
      url: `${base}/spots/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: s.is_featured ? 0.9 : 0.6,
    })),
  ];
}
