import {
  fetchNlBathingWaters,
  fetchNlClassifications,
  type EeaBathingWater,
} from "@/lib/data-sources/eea-bwd";
import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";
import { nameKey } from "@/lib/slug";

/** EEA and PDOK coordinates both come from the national register; beyond
 * this the "nearest" location is probably a different water. */
const MAX_JOIN_KM = 0.5;

export interface IngestEuClassificationResult {
  season: number;
  eeaLocations: number;
  matched: number;
  unmatchedSpots: string[];
  unmatchedEea: string[];
}

/**
 * Annual ingest of the EU bathing-water classification (EEA DISCODATA).
 * Joins EEA locations to our official spots by proximity, falling back to a
 * normalized name match; unofficial spots stay null by design.
 * Shared by the CLI script and the yearly cron route.
 */
export async function ingestEuClassification(
  log: (msg: string) => void = () => {}
): Promise<IngestEuClassificationResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  const spots = await store.getSpots();
  if (spots.length === 0) {
    throw new Error("No spots in store — run ingest-locations first.");
  }

  log("Fetching EEA bathing-water locations + classifications…");
  const [locations, { season, rows }] = await Promise.all([
    fetchNlBathingWaters(),
    fetchNlClassifications(),
  ]);
  const qualityById = new Map(rows.map((r) => [r.id, r.quality]));
  // Only locations that actually have a classification this season are join
  // candidates — the spatial registry keeps delisted waters around.
  const candidates = locations.filter((l) => qualityById.has(l.id));
  log(
    `Season ${season}: ${rows.length} classifications, ` +
      `${candidates.length} of ${locations.length} registry locations classified`
  );

  // EEA names look like "SPOEKEPLAS, NOORDWOLDE" — the part before the comma
  // is the water's name as PDOK knows it.
  const byNameKey = new Map<string, EeaBathingWater>();
  for (const l of candidates) {
    byNameKey.set(nameKey(l.name.split(",")[0]), l);
  }

  const official = spots.filter((s) => s.official_status === "official");
  const matchedEeaIds = new Set<string>();
  const unmatchedSpots: string[] = [];
  let matched = 0;

  for (const spot of official) {
    let best: EeaBathingWater | null = null;
    let bestKm = MAX_JOIN_KM;
    for (const l of candidates) {
      const km = haversineKm(spot.lat, spot.lng, l.lat, l.lon);
      if (km < bestKm) {
        best = l;
        bestKm = km;
      }
    }
    if (!best) best = byNameKey.get(nameKey(spot.name)) ?? null;

    if (best) {
      await store.setEuClassification(spot.id, {
        bw_id: best.id,
        classification: qualityById.get(best.id)!,
        year: season,
      });
      // The registry also knows the water category (sea/lake/river/…) —
      // backfill it from the same join.
      if (best.category && spot.water_type !== best.category) {
        await store.setWaterType(spot.id, best.category);
      }
      matchedEeaIds.add(best.id);
      matched++;
    } else {
      unmatchedSpots.push(spot.name);
    }
  }

  const unmatchedEea = candidates
    .filter((l) => !matchedEeaIds.has(l.id))
    .map((l) => `${l.id} ${l.name}`);

  log(
    `Matched ${matched}/${official.length} official spots ` +
      `(${unmatchedSpots.length} spots and ${unmatchedEea.length} EEA locations unmatched).`
  );
  if (unmatchedSpots.length > 0) {
    log(`Unmatched spots: ${unmatchedSpots.slice(0, 10).join("; ")}…`);
  }
  return {
    season,
    eeaLocations: candidates.length,
    matched,
    unmatchedSpots,
    unmatchedEea,
  };
}
