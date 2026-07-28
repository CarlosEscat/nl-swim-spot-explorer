import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  RwsStation,
  SpotWithData,
  SwimSpot,
  SwimSpotDetails,
  WaterQualityReading,
} from "@/lib/types";
import { defaultQualitySince, type DataStore } from "./store";

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Service role for scripts/cron (bypasses RLS for writes); anon is enough for reads.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

function throwIfError<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase error: ${res.error.message}`);
  return res.data;
}

/** PostgREST caps an unbounded select at 1,000 rows and gives no error when it does. */
const PAGE_SIZE = 1000;

/**
 * The most recent reading per spot, across the whole table.
 *
 * Must paginate: a plain `select("*")` silently stops at 1,000 rows, and since
 * an all-clear reading is dated today while an advisory keeps the date the
 * advisory started, the truncated window holds nothing but the last day or two
 * of all-clears — every spot actually under warning sorts below the cut and
 * comes back as "no data". See scripts/probe-readings-limit.ts.
 */
async function latestQualityBySpot(): Promise<Map<string, WaterQualityReading>> {
  const latest = new Map<string, WaterQualityReading>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = throwIfError(
      await db()
        .from("water_quality_readings")
        .select("*")
        .order("measured_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1)
    ) as WaterQualityReading[];
    // Descending by date, so the first row seen for a spot is its latest.
    for (const r of page) if (!latest.has(r.spot_id)) latest.set(r.spot_id, r);
    if (page.length < PAGE_SIZE) return latest;
  }
}

export const supabaseStore: DataStore = {
  name: "Supabase",

  async upsertSpots(spots) {
    // Slug is the stable identity across ingestion runs.
    // Chunk to stay well under request size limits.
    for (let i = 0; i < spots.length; i += 500) {
      throwIfError(
        await db()
          .from("swim_spots")
          .upsert(
            spots.slice(i, i + 500).map((s) => ({
              ...s,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "slug", ignoreDuplicates: false }
          )
      );
    }
    const { count, error } = await db()
      .from("swim_spots")
      .select("*", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async getSpots() {
    return throwIfError(
      await db().from("swim_spots").select("*").order("name")
    ) as SwimSpot[];
  },

  async upsertDetails(details) {
    throwIfError(
      await db()
        .from("swim_spot_details")
        .upsert(
          details.map((d) => ({ ...d, updated_at: new Date().toISOString() })),
          { onConflict: "spot_id" }
        )
    );
  },

  async insertQualityReadings(readings) {
    let added = 0;
    for (let i = 0; i < readings.length; i += 500) {
      const chunk = readings.slice(i, i + 500);
      const { data, error } = await db()
        .from("water_quality_readings")
        .upsert(chunk, {
          onConflict: "spot_id,measured_at,source",
          ignoreDuplicates: true,
        })
        .select("id");
      if (error) throw new Error(error.message);
      added += data?.length ?? 0;
    }
    return added;
  },

  async upsertStations(stations) {
    throwIfError(
      await db().from("rws_stations").upsert(stations, { onConflict: "id" })
    );
  },

  async getStations() {
    return throwIfError(
      await db().from("rws_stations").select("*")
    ) as RwsStation[];
  },

  async setNearestStation(spotId, stationId) {
    throwIfError(
      await db()
        .from("swim_spots")
        .update({ nearest_rws_station_id: stationId })
        .eq("id", spotId)
    );
  },

  async getQualityHistory(spotId, sinceIso) {
    return throwIfError(
      await db()
        .from("water_quality_readings")
        .select("*")
        .eq("spot_id", spotId)
        .gte("measured_at", sinceIso ?? defaultQualitySince())
        .order("measured_at", { ascending: true })
    ) as WaterQualityReading[];
  },

  async setFeaturedSpots(spotIds) {
    throwIfError(
      await db()
        .from("swim_spots")
        .update({ is_featured: false })
        .eq("is_featured", true)
    );
    for (let i = 0; i < spotIds.length; i += 500) {
      throwIfError(
        await db()
          .from("swim_spots")
          .update({ is_featured: true })
          .in("id", spotIds.slice(i, i + 500))
      );
    }
  },

  async setWaterType(spotId, waterType) {
    throwIfError(
      await db()
        .from("swim_spots")
        .update({ water_type: waterType })
        .eq("id", spotId)
    );
  },

  async setZwemwaterId(spotId, zwemwaterId) {
    throwIfError(
      await db()
        .from("swim_spots")
        .update({ zwemwater_id: zwemwaterId })
        .eq("id", spotId)
    );
  },

  async setEuClassification(spotId, c) {
    throwIfError(
      await db()
        .from("swim_spots")
        .update({
          eu_bw_id: c?.bw_id ?? null,
          eu_classification: c?.classification ?? null,
          eu_classification_year: c?.year ?? null,
        })
        .eq("id", spotId)
    );
  },

  async getSpotsWithData() {
    const spots = throwIfError(
      await db()
        .from("swim_spots")
        .select("*, swim_spot_details(*)")
        .order("name")
    ) as (SwimSpot & { swim_spot_details: SwimSpotDetails[] | SwimSpotDetails | null })[];

    const latestBySpot = await latestQualityBySpot();

    return spots.map<SpotWithData>((s) => {
      const { swim_spot_details, ...spot } = s;
      const details = Array.isArray(swim_spot_details)
        ? swim_spot_details[0] ?? null
        : swim_spot_details;
      return {
        ...spot,
        details,
        latest_quality: latestBySpot.get(s.id) ?? null,
      };
    });
  },

  async getSpotBySlug(slug) {
    const { data, error } = await db()
      .from("swim_spots")
      .select("*, swim_spot_details(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const { swim_spot_details, ...spot } = data as SwimSpot & {
      swim_spot_details: SwimSpotDetails[] | SwimSpotDetails | null;
    };
    const { data: reading } = await db()
      .from("water_quality_readings")
      .select("*")
      .eq("spot_id", spot.id)
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      ...spot,
      details: Array.isArray(swim_spot_details)
        ? swim_spot_details[0] ?? null
        : swim_spot_details,
      latest_quality: (reading as WaterQualityReading) ?? null,
    };
  },
};
