import type { EuClassification, WaterType } from "@/lib/types";

// EEA bathing-water directive data via DISCODATA (SQL-over-HTTP, no auth).
// The [latest] schema lags the annual report by a few months; ingest always
// takes MAX(season) so re-runs pick up new years automatically.
const BASE = "https://discodata.eea.europa.eu/sql";
const PAGE_SIZE = 1000;

async function sqlQuery<T>(query: string): Promise<T[]> {
  const rows: T[] = [];
  for (let p = 1; ; p++) {
    const res = await fetch(
      `${BASE}?query=${encodeURIComponent(query)}&p=${p}&nrOfHits=${PAGE_SIZE}`
    );
    if (!res.ok) throw new Error(`DISCODATA query failed: ${res.status}`);
    const json = (await res.json()) as { results?: T[] };
    const page = json.results ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export interface EeaBathingWater {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** EEA water category ("coastalBathingWater" → "sea", etc.); null when unknown. */
  category: WaterType | null;
}

const CATEGORY_MAP: Record<string, WaterType> = {
  coastalBathingWater: "sea",
  lakeBathingWater: "lake",
  riverBathingWater: "river",
  transitionalBathingWater: "transitional",
};

/** All NL bathing-water locations with coordinates, latest registry year per id. */
export async function fetchNlBathingWaters(): Promise<EeaBathingWater[]> {
  const rows = await sqlQuery<{
    thematicIdIdentifier: string;
    nameText: string;
    lat: number | null;
    lon: number | null;
    specialisedZoneType: string | null;
    cYear: number;
  }>(
    "SELECT thematicIdIdentifier, nameText, lat, lon, specialisedZoneType, cYear " +
      "FROM [WISE_BWD].[latest].[spatial_ProtectedArea] " +
      "WHERE countryCode='NL'"
  );
  const latest = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    if (r.lat == null || r.lon == null) continue;
    const cur = latest.get(r.thematicIdIdentifier);
    if (!cur || r.cYear > cur.cYear) latest.set(r.thematicIdIdentifier, r);
  }
  return [...latest.values()].map((r) => ({
    id: r.thematicIdIdentifier,
    name: r.nameText,
    lat: r.lat!,
    lon: r.lon!,
    category: CATEGORY_MAP[r.specialisedZoneType ?? ""] ?? null,
  }));
}

const QUALITY_MAP: Record<string, EuClassification> = {
  "0": "not_classified",
  "1": "excellent",
  "2": "good",
  "3": "sufficient",
  "4": "poor",
};

export interface EeaClassificationRow {
  id: string;
  quality: EuClassification;
}

/** Latest-season annual classifications for all NL bathing waters. */
export async function fetchNlClassifications(): Promise<{
  season: number;
  rows: EeaClassificationRow[];
}> {
  const [{ season }] = await sqlQuery<{ season: number }>(
    "SELECT MAX(season) AS season " +
      "FROM [WISE_BWD].[latest].[assessment_BathingWaterStatus] " +
      "WHERE countryCode='NL'"
  );
  const raw = await sqlQuery<{
    bathingWaterIdentifier: string;
    quality: string; // e.g. "1 - Excellent"
  }>(
    "SELECT bathingWaterIdentifier, quality " +
      "FROM [WISE_BWD].[latest].[assessment_BathingWaterStatus] " +
      `WHERE countryCode='NL' AND season=${season}`
  );
  const rows: EeaClassificationRow[] = [];
  for (const r of raw) {
    const quality = QUALITY_MAP[r.quality?.trim()?.[0] ?? ""];
    if (quality) rows.push({ id: r.bathingWaterIdentifier, quality });
  }
  return { season, rows };
}
