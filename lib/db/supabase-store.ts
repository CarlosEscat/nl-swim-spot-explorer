import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  RwsStation,
  SpotWithData,
  SwimSpot,
  SwimSpotDetails,
  WaterQualityReading,
} from "@/lib/types";
import type { DataStore } from "./store";

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

  async getSpotsWithData() {
    const spots = throwIfError(
      await db()
        .from("swim_spots")
        .select("*, swim_spot_details(*)")
        .order("name")
    ) as (SwimSpot & { swim_spot_details: SwimSpotDetails[] | SwimSpotDetails | null })[];

    // Latest reading per spot; the table stays small enough (~700 spots × monthly) to fetch and reduce.
    const readings = throwIfError(
      await db()
        .from("water_quality_readings")
        .select("*")
        .order("measured_at", { ascending: false })
    ) as WaterQualityReading[];
    const latestBySpot = new Map<string, WaterQualityReading>();
    for (const r of readings) {
      if (!latestBySpot.has(r.spot_id)) latestBySpot.set(r.spot_id, r);
    }

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
