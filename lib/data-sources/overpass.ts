// OpenStreetMap Overpass API — bulk POI download for the facilities backfill.
//
// Strategy: one whole-NL area query per category with `out skel center`
// (no tags — the category is known per request), matched to spots locally.
// Spatially-restricted alternatives (multi-center `around:`, per-spot bbox
// clauses) were measured to time out on the public server at 744 spots,
// while the full-country parking dump (~227k elements, the heaviest
// category) completes in ~70 s.

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "nl-swim-spot-explorer/1.0";

export type PoiCategory =
  | "toilets"
  | "parking"
  | "food"
  | "lifeguard"
  | "beach_resort";

export interface OsmPoi {
  category: PoiCategory;
  lat: number;
  lng: number;
}

/** Search radius in meters per category, used by the matching step. */
export const POI_RADIUS_M: Record<PoiCategory, number> = {
  toilets: 300,
  parking: 400,
  food: 300,
  lifeguard: 300,
  beach_resort: 300,
};

const CATEGORY_FILTERS: Record<PoiCategory, string> = {
  toilets: `["amenity"="toilets"]`,
  parking: `["amenity"="parking"]`,
  food: `["amenity"~"^(cafe|restaurant|fast_food|snack_bar|ice_cream)$"]`,
  lifeguard: `["emergency"="lifeguard"]`,
  beach_resort: `["leisure"="beach_resort"]`,
};

interface OverpassElement {
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  let delayMs = 15_000;
  for (let attempt = 1; ; attempt++) {
    let failure: string;
    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as {
          elements?: OverpassElement[];
          remark?: string;
        };
        // Overpass reports runtime errors (e.g. timeouts) as a 200 + remark.
        if (json.remark?.includes("error")) {
          failure = json.remark;
        } else {
          return json.elements ?? [];
        }
      } else if (res.status === 429 || res.status === 504) {
        failure = `${res.status} ${res.statusText}`;
      } else {
        throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (attempt >= 3) throw err;
      failure = err instanceof Error ? err.message : String(err);
    }
    if (attempt >= 3) throw new Error(`Overpass request failed: ${failure}`);
    await new Promise((r) => setTimeout(r, delayMs));
    delayMs *= 2;
  }
}

/**
 * Fetch all POIs of every facility category in the Netherlands.
 * Sequential requests (public-server politeness); ~2-3 minutes total,
 * dominated by amenity=parking.
 */
export async function fetchNlPois(
  log: (msg: string) => void = () => {}
): Promise<OsmPoi[]> {
  const pois: OsmPoi[] = [];
  for (const category of Object.keys(CATEGORY_FILTERS) as PoiCategory[]) {
    const query = `[out:json][timeout:180];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
nwr${CATEGORY_FILTERS[category]}(area.nl);
out skel center;`;
    const elements = await queryOverpass(query);
    let kept = 0;
    for (const el of elements) {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat == null || lng == null) continue;
      pois.push({ category, lat, lng });
      kept++;
    }
    log(`Overpass: ${kept} ${category} elements`);
  }
  return pois;
}
