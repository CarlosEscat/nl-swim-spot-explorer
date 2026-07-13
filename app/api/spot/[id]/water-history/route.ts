import { NextResponse } from "next/server";
import {
  fetchWaterTempHistory,
  type DailyWaterTemp,
} from "@/lib/data-sources/rws-ddl";
import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";

export interface WaterTempHistoryResponse {
  station_id: string | null;
  station_name: string | null;
  distance_km: number | null;
  days: DailyWaterTemp[];
  /** Last daily average minus the average ~7 days earlier; null when unknown. */
  week_delta_c: number | null;
}

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
};

/**
 * Daily water-temperature history (14 days) for one spot's nearest RWS
 * station, powering the sparkline. Sparse or missing station history returns
 * an empty `days` — the UI treats the sparkline as progressive enhancement.
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

  const empty: WaterTempHistoryResponse = {
    station_id: spot.nearest_rws_station_id,
    station_name: null,
    distance_km: null,
    days: [],
    week_delta_c: null,
  };
  if (!spot.nearest_rws_station_id) {
    return NextResponse.json(empty, { headers: CACHE_HEADERS });
  }

  const days = await fetchWaterTempHistory(spot.nearest_rws_station_id, 14);
  if (days.length < 3) {
    return NextResponse.json(empty, { headers: CACHE_HEADERS });
  }

  const station = (await store.getStations()).find(
    (s) => s.id === spot.nearest_rws_station_id
  );

  const last = days[days.length - 1];
  const weekAgoDate = new Date(
    new Date(`${last.date}T00:00:00Z`).getTime() - 7 * 24 * 3600 * 1000
  )
    .toISOString()
    .slice(0, 10);
  const weekAgo = days.find((d) => d.date >= weekAgoDate);
  const week_delta_c =
    weekAgo && weekAgo.date !== last.date
      ? Math.round((last.avg_c - weekAgo.avg_c) * 10) / 10
      : null;

  const payload: WaterTempHistoryResponse = {
    station_id: spot.nearest_rws_station_id,
    station_name: station?.name ?? null,
    distance_km: station
      ? Math.round(
          haversineKm(spot.lat, spot.lng, station.lat, station.lng) * 10
        ) / 10
      : null,
    days,
    week_delta_c,
  };
  return NextResponse.json(payload, { headers: CACHE_HEADERS });
}
