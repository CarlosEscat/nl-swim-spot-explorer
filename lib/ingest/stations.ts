import {
  fetchWaterTempStations,
  filterLiveStations,
} from "@/lib/data-sources/rws-ddl";
import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";

/** Cap beyond which a "nearest station" reading is meaningless for a swim spot. */
const MAX_DISTANCE_KM = 25;

export interface RefreshStationsResult {
  catalog: number;
  live: number;
  linked: number;
  spots: number;
}

/**
 * Refresh the live-station list and re-link every spot to its nearest one.
 * Runs after each location ingest: the upsert resets nearest_rws_station_id,
 * and station liveness drifts over time anyway.
 */
export async function refreshStationsAndLinks(
  log: (msg: string) => void = () => {}
): Promise<RefreshStationsResult> {
  const store = await getStore();

  log("Fetching RWS catalogus (stations measuring surface-water temperature)…");
  const all = await fetchWaterTempStations();
  log(`Catalog lists ${all.length} stations; probing for live sensors…`);
  const live = await filterLiveStations(all, 7, log);
  await store.upsertStations(live);
  log(`Kept ${live.length} live stations (${all.length - live.length} historical-only skipped).`);

  const spots = await store.getSpots();
  let linked = 0;
  const updated = spots.map((spot) => {
    let bestId: string | null = null;
    let bestKm = Infinity;
    for (const st of live) {
      const km = haversineKm(spot.lat, spot.lng, st.lat, st.lng);
      if (km < bestKm) {
        bestKm = km;
        bestId = st.id;
      }
    }
    const nearest = bestKm <= MAX_DISTANCE_KM ? bestId : null;
    if (nearest) linked++;
    return { ...spot, nearest_rws_station_id: nearest };
  });
  await store.upsertSpots(updated);
  log(`Linked ${linked}/${spots.length} spots to a live station within ${MAX_DISTANCE_KM} km.`);

  return { catalog: all.length, live: live.length, linked, spots: spots.length };
}
