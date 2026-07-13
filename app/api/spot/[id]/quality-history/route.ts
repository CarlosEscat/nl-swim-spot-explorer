import { NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";
import type { WaterQualityReading } from "@/lib/types";

export interface QualityHistoryResponse {
  readings: WaterQualityReading[];
}

/**
 * This season's stored quality readings for one spot (monthly cron snapshots),
 * powering the season timeline in the map panel. Data changes monthly, so a
 * day of CDN cache is fine.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = await getStore();

  // Accept a slug or a raw id — slugs are what the UI links with.
  const spot =
    (await store.getSpotBySlug(id)) ??
    (await store.getSpotsWithData()).find((s) => s.id === id) ??
    null;
  if (!spot) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  const readings = await store.getQualityHistory(spot.id);
  const payload: QualityHistoryResponse = { readings };
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
