import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  RwsStation,
  SpotWithData,
  SwimSpot,
  SwimSpotDetails,
  WaterQualityReading,
} from "@/lib/types";
import { defaultQualitySince, type DataStore } from "./store";

// File-backed store used when Supabase env vars are absent (local dev / demo).
const DATA_DIR = path.join(process.cwd(), "data", "local");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(value, null, 2));
}

export const localStore: DataStore = {
  name: "local JSON (data/local/)",

  async upsertSpots(spots) {
    const existing = await readJson<SwimSpot[]>("spots.json", []);
    const bySlug = new Map(existing.map((s) => [s.slug, s]));
    for (const spot of spots) {
      const prev = bySlug.get(spot.slug);
      bySlug.set(spot.slug, {
        ...prev,
        ...spot,
        id: prev?.id ?? randomUUID(),
        // Preserve locally-set fields that ingestion doesn't know about
        is_featured: spot.is_featured || prev?.is_featured || false,
        nearest_rws_station_id:
          spot.nearest_rws_station_id ?? prev?.nearest_rws_station_id ?? null,
        webcam_url: spot.webcam_url ?? prev?.webcam_url ?? null,
        eu_bw_id: spot.eu_bw_id ?? prev?.eu_bw_id ?? null,
        eu_classification: spot.eu_classification ?? prev?.eu_classification ?? null,
        eu_classification_year:
          spot.eu_classification_year ?? prev?.eu_classification_year ?? null,
        updated_at: new Date().toISOString(),
      });
    }
    const all = [...bySlug.values()];
    await writeJson("spots.json", all);
    return all.length;
  },

  async getSpots() {
    return readJson<SwimSpot[]>("spots.json", []);
  },

  async upsertDetails(details) {
    const existing = await readJson<SwimSpotDetails[]>("details.json", []);
    const byId = new Map(existing.map((d) => [d.spot_id, d]));
    for (const d of details) {
      byId.set(d.spot_id, { ...d, updated_at: new Date().toISOString() });
    }
    await writeJson("details.json", [...byId.values()]);
  },

  async insertQualityReadings(readings) {
    const existing = await readJson<WaterQualityReading[]>("quality.json", []);
    const seen = new Set(
      existing.map((r) => `${r.spot_id}|${r.measured_at}|${r.source}`)
    );
    let added = 0;
    for (const r of readings) {
      const key = `${r.spot_id}|${r.measured_at}|${r.source}`;
      if (seen.has(key)) continue;
      seen.add(key);
      existing.push({ ...r, id: randomUUID(), created_at: new Date().toISOString() });
      added++;
    }
    await writeJson("quality.json", existing);
    return added;
  },

  async upsertStations(stations) {
    const existing = await readJson<RwsStation[]>("stations.json", []);
    const byId = new Map(existing.map((s) => [s.id, s]));
    for (const s of stations) byId.set(s.id, s);
    await writeJson("stations.json", [...byId.values()]);
  },

  async getStations() {
    return readJson<RwsStation[]>("stations.json", []);
  },

  async setNearestStation(spotId, stationId) {
    const spots = await readJson<SwimSpot[]>("spots.json", []);
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      spot.nearest_rws_station_id = stationId;
      await writeJson("spots.json", spots);
    }
  },

  async getQualityHistory(spotId, sinceIso) {
    const since = sinceIso ?? defaultQualitySince();
    const quality = await readJson<WaterQualityReading[]>("quality.json", []);
    return quality
      .filter((r) => r.spot_id === spotId && r.measured_at >= since)
      .sort((a, b) => (a.measured_at < b.measured_at ? -1 : 1));
  },

  async setFeaturedSpots(spotIds) {
    const spots = await readJson<SwimSpot[]>("spots.json", []);
    const ids = new Set(spotIds);
    for (const s of spots) s.is_featured = ids.has(s.id);
    await writeJson("spots.json", spots);
  },

  async setWaterType(spotId, waterType) {
    const spots = await readJson<SwimSpot[]>("spots.json", []);
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      spot.water_type = waterType;
      await writeJson("spots.json", spots);
    }
  },

  async setEuClassification(spotId, c) {
    const spots = await readJson<SwimSpot[]>("spots.json", []);
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      spot.eu_bw_id = c?.bw_id ?? null;
      spot.eu_classification = c?.classification ?? null;
      spot.eu_classification_year = c?.year ?? null;
      await writeJson("spots.json", spots);
    }
  },

  async getSpotsWithData() {
    const [spots, details, quality] = await Promise.all([
      readJson<SwimSpot[]>("spots.json", []),
      readJson<SwimSpotDetails[]>("details.json", []),
      readJson<WaterQualityReading[]>("quality.json", []),
    ]);
    const detailsById = new Map(details.map((d) => [d.spot_id, d]));
    const latestBySpot = new Map<string, WaterQualityReading>();
    for (const r of quality) {
      const cur = latestBySpot.get(r.spot_id);
      if (!cur || r.measured_at > cur.measured_at) latestBySpot.set(r.spot_id, r);
    }
    return spots.map<SpotWithData>((s) => ({
      ...s,
      details: detailsById.get(s.id) ?? null,
      latest_quality: latestBySpot.get(s.id) ?? null,
    }));
  },

  async getSpotBySlug(slug) {
    const all = await this.getSpotsWithData();
    return all.find((s) => s.slug === slug) ?? null;
  },
};
