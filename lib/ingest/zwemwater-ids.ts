import { fetchLocationList } from "@/lib/data-sources/zwemwater";
import { getStore } from "@/lib/db/store";
import { nameKey } from "@/lib/slug";

export interface IngestZwemwaterIdsResult {
  zwemwaterLocations: number;
  matched: number;
  unmatchedSpots: string[];
}

/**
 * Match our spots to zwemwater.nl's internal location ids by normalized name
 * (same nameKey approach as the advisory ingest). The id powers the
 * per-spot bacteriological measurements chart. Only official spots are
 * matched — unofficial spots don't exist on zwemwater.nl by definition.
 */
export async function ingestZwemwaterIds(
  log: (msg: string) => void = () => {}
): Promise<IngestZwemwaterIdsResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  const spots = await store.getSpots();
  if (spots.length === 0) {
    throw new Error("No spots in store — run ingest-locations first.");
  }

  log("Fetching zwemwater.nl location list…");
  const locations = await fetchLocationList();
  log(`${locations.length} zwemwater.nl locations`);

  const byKey = new Map<string, string>();
  for (const l of locations) {
    const key = nameKey(l.name);
    // First occurrence wins; duplicate names are rare and ambiguous anyway.
    if (key && !byKey.has(key)) byKey.set(key, l.id);
  }

  const official = spots.filter((s) => s.official_status === "official");
  const unmatchedSpots: string[] = [];
  let matched = 0;

  for (const spot of official) {
    // PDOK names often append ", <place>" that zwemwater.nl's names lack —
    // fall back to matching the part before the comma.
    const id =
      byKey.get(nameKey(spot.name)) ??
      byKey.get(nameKey(spot.name.split(",")[0])) ??
      null;
    if (id) matched++;
    else unmatchedSpots.push(spot.name);
    if ((spot.zwemwater_id ?? null) !== id) {
      await store.setZwemwaterId(spot.id, id);
    }
  }

  log(
    `Matched ${matched}/${official.length} official spots` +
      (unmatchedSpots.length
        ? `; unmatched: ${unmatchedSpots.slice(0, 10).join(", ")}${unmatchedSpots.length > 10 ? "…" : ""}`
        : "")
  );
  return { zwemwaterLocations: locations.length, matched, unmatchedSpots };
}
