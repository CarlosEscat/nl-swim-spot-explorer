import { NextResponse } from "next/server";
import { fetchCurrentWeatherBatch } from "@/lib/data-sources/open-meteo";
import { fetchLatestWaterTemps } from "@/lib/data-sources/rws-ddl";
import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";
import type { LiveSpotSummary, LiveSummaryResponse } from "@/lib/types";

export const maxDuration = 60;

// Weather is fetched per ~11 km grid cell, not per spot: Open-Meteo's rate
// limiter weighs a multi-location call as N calls (~600/min burst), so 744
// spots would lose the tail chunks, while the ~338 cells fit comfortably.
// Cell centers also give stable URLs, so the upstream fetch cache hits.
const WEATHER_CELL_DEG = 0.1;

/**
 * Live snapshot for ALL spots in one response, for the "best right now"
 * ranking. Contains nothing user-specific (distance to the user is computed
 * client-side), so the response is globally cacheable at the CDN.
 * Upstream cost when cold: ~2 RWS POSTs (unique stations, batched 60/req)
 * + ~4 Open-Meteo GETs (100 grid cells/req), each itself cached 30 min.
 */
export async function GET() {
  const store = await getStore();
  const [spots, stations] = await Promise.all([
    store.getSpotsWithData(),
    store.getStations(),
  ]);
  const stationById = new Map(stations.map((s) => [s.id, s]));
  const stationCodes = [
    ...new Set(
      spots
        .map((s) => s.nearest_rws_station_id)
        .filter((id): id is string => id != null)
    ),
  ];

  const cellKey = (lat: number, lng: number) =>
    `${Math.round(lat / WEATHER_CELL_DEG)}|${Math.round(lng / WEATHER_CELL_DEG)}`;
  const cellKeys = [...new Set(spots.map((s) => cellKey(s.lat, s.lng)))];
  const cellCoords = cellKeys.map((key) => {
    const [row, col] = key.split("|").map(Number);
    return { lat: row * WEATHER_CELL_DEG, lng: col * WEATHER_CELL_DEG };
  });

  const [waterByStation, cellWeather] = await Promise.all([
    fetchLatestWaterTemps(stationCodes),
    fetchCurrentWeatherBatch(cellCoords),
  ]);
  const weatherByCell = new Map(cellKeys.map((key, i) => [key, cellWeather[i]]));

  const summaries = spots.map<LiveSpotSummary>((spot) => {
    const water = spot.nearest_rws_station_id
      ? waterByStation.get(spot.nearest_rws_station_id)
      : undefined;
    const station = spot.nearest_rws_station_id
      ? stationById.get(spot.nearest_rws_station_id)
      : undefined;
    const w = weatherByCell.get(cellKey(spot.lat, spot.lng));
    return {
      id: spot.id,
      water_temp_c: water?.temperatureC ?? null,
      water_station_distance_km: station
        ? Math.round(haversineKm(spot.lat, spot.lng, station.lat, station.lng) * 10) / 10
        : null,
      air_temp_c: w?.temperature_c ?? null,
      weather_code: w?.weather_code ?? null,
      wind_kmh: w?.wind_speed_kmh ?? null,
    };
  });

  const body: LiveSummaryResponse = {
    generated_at: new Date().toISOString(),
    spots: summaries,
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
