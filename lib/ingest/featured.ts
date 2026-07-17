import { getStore } from "@/lib/db/store";
import type { SpotWithData } from "@/lib/types";
import { isFeaturedName } from "./featured-spots";

/** Cap per province so featured spots stay a curated-feeling shortlist. */
const PER_PROVINCE = 5;

function facilityScore(s: SpotWithData): number {
  const d = s.details;
  if (!d) return 0;
  return [
    d.has_restrooms,
    d.has_catering,
    d.has_parking,
    d.has_lifeguard,
    d.lounging_area,
  ].filter((v) => v === true).length;
}

export interface RecomputeFeaturedResult {
  featured: number;
  handPicked: number;
  perProvince: Record<string, number>;
}

/**
 * Derive the featured set from data instead of a hardcoded list: official
 * spots rated "excellent" in the latest EU classification, ranked by how many
 * facilities they offer, capped per province. The hand-picked names in
 * featured-spots.ts are always included on top. Run after the EU and
 * facilities ingests (both feed the ranking).
 */
export async function recomputeFeatured(
  log: (msg: string) => void = () => {}
): Promise<RecomputeFeaturedResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  const spots = await store.getSpotsWithData();
  if (spots.length === 0) {
    throw new Error("No spots in store — run ingest-locations first.");
  }

  const featured = new Set<string>();
  let handPicked = 0;
  for (const s of spots) {
    if (isFeaturedName(s.name)) {
      featured.add(s.id);
      handPicked++;
    }
  }

  const byProvince = new Map<string, SpotWithData[]>();
  for (const s of spots) {
    if (s.official_status !== "official") continue;
    if (s.eu_classification !== "excellent") continue;
    if (facilityScore(s) < 1) continue;
    byProvince.set(s.province, [...(byProvince.get(s.province) ?? []), s]);
  }

  const perProvince: Record<string, number> = {};
  for (const [province, candidates] of byProvince) {
    candidates.sort(
      (a, b) =>
        facilityScore(b) - facilityScore(a) || a.name.localeCompare(b.name)
    );
    const picks = candidates.slice(0, PER_PROVINCE);
    for (const p of picks) featured.add(p.id);
    perProvince[province] = picks.length;
    log(`  ${province}: ${picks.map((p) => p.name).join(", ")}`);
  }

  await store.setFeaturedSpots([...featured]);
  log(
    `Featured ${featured.size} spots across ${Object.keys(perProvince).length} provinces ` +
      `(${handPicked} hand-picked).`
  );
  return { featured: featured.size, handPicked, perProvince };
}
