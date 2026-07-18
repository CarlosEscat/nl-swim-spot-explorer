import { getStore } from "@/lib/db/store";
import { nameKey } from "@/lib/slug";
import type { SwimSpotDetails } from "@/lib/types";

/**
 * One hand-curated details record, matched to a spot by (normalized) PDOK name.
 * null means "checked but unknown" — it falls back to any OSM-detected value
 * already in the store; an explicit true/false always wins.
 */
export type DetailSeed = Omit<
  SwimSpotDetails,
  "spot_id" | "facilities_source" | "updated_at"
> & { name: string };

export interface SeedDetailsResult {
  seeded: number;
  missing: string[];
}

/** Upsert curated seeds (see lib/ingest/curated/) as authoritative 'manual' details. */
export async function seedCuratedDetails(
  seeds: DetailSeed[],
  log: (msg: string) => void = () => {}
): Promise<SeedDetailsResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  const spots = await store.getSpotsWithData();
  const byKey = new Map(spots.map((s) => [nameKey(s.name), s]));

  const details: SwimSpotDetails[] = [];
  const missing: string[] = [];
  for (const seed of seeds) {
    const spot = byKey.get(nameKey(seed.name));
    if (!spot) {
      missing.push(seed.name);
      continue;
    }
    const prev = spot.details;
    details.push({
      spot_id: spot.id,
      has_restrooms: seed.has_restrooms ?? prev?.has_restrooms ?? null,
      has_catering: seed.has_catering ?? prev?.has_catering ?? null,
      has_parking: seed.has_parking ?? prev?.has_parking ?? null,
      has_lifeguard: seed.has_lifeguard ?? prev?.has_lifeguard ?? null,
      has_boat_ramp: seed.has_boat_ramp ?? prev?.has_boat_ramp ?? null,
      nude_recreation: seed.nude_recreation ?? prev?.nude_recreation ?? null,
      lounging_area: seed.lounging_area ?? prev?.lounging_area ?? null,
      access_notes_nl: seed.access_notes_nl,
      access_notes_en: seed.access_notes_en,
      facilities_source: "manual",
    });
  }

  await store.upsertDetails(details);
  log(`Seeded curated details for ${details.length}/${seeds.length} spots.`);
  for (const name of missing) {
    log(`⚠ No spot found for "${name}" — check the name against the store.`);
  }
  return { seeded: details.length, missing };
}
