import { NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/data-sources/open-meteo";
import { fetchLatestWaterTemp } from "@/lib/data-sources/rws-ddl";
import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";
import type { SpotLiveData } from "@/lib/types";

/**
 * Live conditions for one spot: current weather at its exact coordinates plus
 * the latest water temperature from its nearest RWS station. Both upstream
 * fetches are cached (revalidate 30 min); quality/location data stays in the
 * cron-refreshed store, deliberately not here.
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

  const [weather, water] = await Promise.all([
    fetchCurrentWeather(spot.lat, spot.lng),
    spot.nearest_rws_station_id
      ? fetchLatestWaterTemp(spot.nearest_rws_station_id)
      : Promise.resolve(null),
  ]);

  let distanceKm: number | null = null;
  if (water) {
    const station = (await store.getStations()).find(
      (s) => s.id === water.stationId
    );
    if (station) {
      distanceKm =
        Math.round(haversineKm(spot.lat, spot.lng, station.lat, station.lng) * 10) /
        10;
    }
  }

  const payload: SpotLiveData = {
    weather,
    water: water
      ? {
          station_id: water.stationId,
          station_name: water.stationName,
          temperature_c: water.temperatureC,
          measured_at: water.measuredAt,
          distance_km: distanceKm,
        }
      : null,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
