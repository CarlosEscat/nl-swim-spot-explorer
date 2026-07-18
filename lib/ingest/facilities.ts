import {
  fetchNlPois,
  POI_RADIUS_M,
  type OsmPoi,
  type PoiCategory,
} from "@/lib/data-sources/overpass";
import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";
import type { SwimSpotDetails } from "@/lib/types";

export interface IngestFacilitiesResult {
  pois: number;
  spots: number;
  withRestrooms: number;
  withParking: number;
  withCatering: number;
  withLifeguard: number;
}

// Grid cell of ~1.1 km (0.01° lat) — larger than any search radius, so a
// 3×3 neighborhood scan around a spot's cell sees every candidate POI.
const CELL_DEG = 0.01;

/** Spatial hash over POIs; ~300k POIs × 744 spots brute force would be slow. */
class PoiIndex {
  private cells = new Map<string, OsmPoi[]>();

  constructor(pois: OsmPoi[]) {
    for (const poi of pois) {
      const key = PoiIndex.cellKey(poi.category, poi.lat, poi.lng);
      const cell = this.cells.get(key);
      if (cell) cell.push(poi);
      else this.cells.set(key, [poi]);
    }
  }

  private static cellKey(category: PoiCategory, lat: number, lng: number) {
    return `${category}|${Math.round(lat / CELL_DEG)}|${Math.round(lng / CELL_DEG)}`;
  }

  hasNear(category: PoiCategory, lat: number, lng: number): boolean {
    const radiusKm = POI_RADIUS_M[category] / 1000;
    const row = Math.round(lat / CELL_DEG);
    const col = Math.round(lng / CELL_DEG);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const cell = this.cells.get(`${category}|${row + dr}|${col + dc}`);
        if (!cell) continue;
        for (const poi of cell) {
          if (haversineKm(lat, lng, poi.lat, poi.lng) <= radiusKm) return true;
        }
      }
    }
    return false;
  }
}

/**
 * Backfill facilities for every spot from OpenStreetMap.
 *
 * Toilets, food and parking are well-mapped in NL, so "not found nearby" is
 * recorded as `false`. Lifeguard presence is poorly mapped: only a positive
 * match sets `true`, absence keeps the existing value (usually null/unknown).
 * Hand-curated values (facilities_source 'manual', or any pre-existing
 * non-null field) always win — OSM only fills the gaps.
 * Shared by the CLI script and the monthly cron route.
 */
export async function ingestFacilities(
  log: (msg: string) => void = () => {}
): Promise<IngestFacilitiesResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  const spots = await store.getSpotsWithData();
  if (spots.length === 0) {
    throw new Error("No spots in store — run ingest-locations first.");
  }

  log("Downloading facility POIs for NL from Overpass…");
  const pois = await fetchNlPois(log);
  const index = new PoiIndex(pois);

  const result: IngestFacilitiesResult = {
    pois: pois.length,
    spots: spots.length,
    withRestrooms: 0,
    withParking: 0,
    withCatering: 0,
    withLifeguard: 0,
  };

  const details = spots.map<SwimSpotDetails>((spot) => {
    const prev = spot.details;
    const lifeguard =
      index.hasNear("lifeguard", spot.lat, spot.lng) || undefined;

    const merged: SwimSpotDetails = {
      spot_id: spot.id,
      has_restrooms:
        prev?.has_restrooms ?? index.hasNear("toilets", spot.lat, spot.lng),
      has_catering:
        prev?.has_catering ?? index.hasNear("food", spot.lat, spot.lng),
      has_parking:
        prev?.has_parking ?? index.hasNear("parking", spot.lat, spot.lng),
      // Positive evidence only; absence of OSM data is not "no lifeguard".
      has_lifeguard: prev?.has_lifeguard ?? lifeguard ?? null,
      has_boat_ramp: prev?.has_boat_ramp ?? null,
      nude_recreation: prev?.nude_recreation ?? null,
      lounging_area:
        prev?.lounging_area ??
        (index.hasNear("beach_resort", spot.lat, spot.lng) || null),
      access_notes_nl: prev?.access_notes_nl ?? null,
      access_notes_en: prev?.access_notes_en ?? null,
      facilities_source: prev?.facilities_source ?? (prev ? "manual" : "osm"),
    };

    if (merged.has_restrooms) result.withRestrooms++;
    if (merged.has_parking) result.withParking++;
    if (merged.has_catering) result.withCatering++;
    if (merged.has_lifeguard) result.withLifeguard++;
    return merged;
  });

  await store.upsertDetails(details);
  log(
    `Wrote details for ${details.length} spots — restrooms: ${result.withRestrooms}, ` +
      `parking: ${result.withParking}, food: ${result.withCatering}, ` +
      `lifeguard: ${result.withLifeguard}.`
  );
  return result;
}
