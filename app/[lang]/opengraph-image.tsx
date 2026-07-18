import { ImageResponse } from "next/og";
import { getStore } from "@/lib/db/store";
import { defaultLocale, getDictionary, hasLocale, t } from "@/lib/i18n";

// Site-wide OG image: used by the homepage and inherited by the region
// pages; spot pages have their own aerial-photo version one level deeper.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function OgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spots = await store.getSpots();
  const officialCount = spots.filter(
    (s) => s.official_status === "official"
  ).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #0369a1 60%, #082f49 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, opacity: 0.95 }}>
          🏊 {dict.site.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            marginTop: 12,
            lineHeight: 1.1,
          }}
        >
          {dict.home.h1}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            opacity: 0.85,
          }}
        >
          {t(dict.region.spot_count, { count: officialCount })}
        </div>
      </div>
    ),
    size
  );
}
