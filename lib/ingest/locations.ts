import { fetchSwimLocations, reverseGeocode } from "@/lib/data-sources/pdok";
import { getStore } from "@/lib/db/store";
import { slugify } from "@/lib/slug";
import { isFeaturedName } from "./featured-spots";
import type { SwimSpot } from "@/lib/types";

const GEOCODE_CONCURRENCY = 6;

export interface IngestLocationsResult {
  parsed: number;
  upserted: number;
  featured: number;
  total: number;
}

/**
 * Pull the PDOK Zwemwaterlocaties dataset and upsert every official spot.
 * Shared by the CLI script and the weekly cron route.
 */
export async function ingestLocations(
  log: (msg: string) => void = () => {}
): Promise<IngestLocationsResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  log("Downloading PDOK Zwemwaterlocaties GML…");
  const locations = await fetchSwimLocations();
  log(`Parsed ${locations.length} bathing-water locations`);

  // Keep province/municipality already resolved in a previous run — the
  // locatieserver answer for a fixed coordinate doesn't change.
  const existing = new Map(
    (await store.getSpots()).map((s) => [s.slug, s] as const)
  );

  log("Reverse-geocoding municipalities/provinces (PDOK Locatieserver)…");
  const geocoded: { municipality: string | null; province: string | null }[] =
    new Array(locations.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: GEOCODE_CONCURRENCY }, async () => {
      while (next < locations.length) {
        const i = next++;
        const loc = locations[i];
        const prev = existing.get(slugify(loc.name));
        if (prev?.province && prev.province !== "Unknown") {
          geocoded[i] = {
            municipality: prev.municipality,
            province: prev.province,
          };
        } else {
          geocoded[i] = await reverseGeocode(loc.lat, loc.lng);
        }
        if (++done % 100 === 0) log(`  ${done}/${locations.length}`);
      }
    })
  );

  // Build slugs; disambiguate duplicate names with municipality, then an index.
  const byName = new Map<string, number[]>();
  locations.forEach((loc, i) => {
    const base = slugify(loc.name);
    byName.set(base, [...(byName.get(base) ?? []), i]);
  });
  const slugs: string[] = new Array(locations.length);
  for (const [base, idxs] of byName) {
    if (idxs.length === 1) {
      slugs[idxs[0]] = base;
      continue;
    }
    const seen = new Set<string>();
    for (const i of idxs) {
      let slug = geocoded[i].municipality
        ? `${base}-${slugify(geocoded[i].municipality!)}`
        : base;
      let n = 2;
      while (seen.has(slug)) slug = `${base}-${n++}`;
      seen.add(slug);
      slugs[i] = slug;
    }
  }

  const spots = locations.map<Omit<SwimSpot, "id" | "created_at" | "updated_at">>(
    (loc, i) => ({
      name: loc.name,
      slug: slugs[i],
      province: geocoded[i].province ?? "Unknown",
      municipality: geocoded[i].municipality,
      lat: loc.lat,
      lng: loc.lng,
      water_type: null,
      official_status: "official",
      is_featured: isFeaturedName(loc.name),
      nearest_rws_station_id: null,
      webcam_url: null,
    })
  );

  const total = await store.upsertSpots(spots as SwimSpot[]);
  const featured = spots.filter((s) => s.is_featured).length;
  log(`Upserted ${spots.length} spots (${featured} featured); store now has ${total}.`);
  return { parsed: locations.length, upserted: spots.length, featured, total };
}
