import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { GUIDES } from "@/lib/content/guides";
import { getStore } from "@/lib/db/store";
import { listProvinces, provinceSlug } from "@/lib/regions";

// Canonical (Dutch, unprefixed) URLs with hreflang alternates; English lives
// under /en and is announced via the alternates rather than separate entries.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const store = await getStore();
  const spots = await store.getSpots();

  const regionEntry = (path: string): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: { nl: `${base}${path}`, en: `${base}/en${path}` },
    },
  });

  return [
    {
      url: base,
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: { nl: base, en: `${base}/en` },
      },
    },
    ...listProvinces(spots).map((p) =>
      regionEntry(`/zwemplekken/${provinceSlug(p)}`)
    ),
    ...CITIES.map((c) => regionEntry(`/zwemmen/${c.id}`)),
    regionEntry("/beste-zwemplekken"),
    ...GUIDES.map((g) => ({
      ...regionEntry(`/info/${g.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...spots.map((s) => ({
      url: `${base}/spots/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: s.is_featured ? 0.9 : 0.6,
      alternates: {
        languages: {
          nl: `${base}/spots/${s.slug}`,
          en: `${base}/en/spots/${s.slug}`,
        },
      },
    })),
  ];
}
