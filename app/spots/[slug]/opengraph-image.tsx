import { ImageResponse } from "next/og";
import { getStore } from "@/lib/db/store";
import { qualityStyle } from "@/lib/quality";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const spot = await store.getSpotBySlug(slug);
  const style = qualityStyle(spot?.latest_quality?.status);

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
          background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 60%, #082f49 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, opacity: 0.9 }}>
          🏊 NL Swim Spot Explorer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            marginTop: 12,
            lineHeight: 1.1,
          }}
        >
          {spot?.name ?? "Swim spot"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 24,
            fontSize: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 24,
              height: 24,
              borderRadius: 999,
              background: style.pin,
            }}
          />
          <div style={{ display: "flex" }}>{style.label}</div>
          <div style={{ display: "flex", opacity: 0.7 }}>
            · {[spot?.municipality, spot?.province].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
