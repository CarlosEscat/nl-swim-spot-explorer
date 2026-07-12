import type {
  RwsStation,
  SpotWithData,
  SwimSpot,
  SwimSpotDetails,
  WaterQualityReading,
} from "@/lib/types";

/** Shared interface for the Supabase store and the local JSON fallback. */
export interface DataStore {
  name: string;
  /** Upsert by slug. Returns total spot count after upsert. */
  upsertSpots(
    spots: Omit<SwimSpot, "id" | "created_at" | "updated_at">[] &
      Partial<Pick<SwimSpot, "id">>[]
  ): Promise<number>;
  getSpots(): Promise<SwimSpot[]>;
  upsertDetails(details: SwimSpotDetails[]): Promise<void>;
  /** Insert readings, skipping (spot_id, measured_at, source) duplicates. Returns inserted count. */
  insertQualityReadings(readings: WaterQualityReading[]): Promise<number>;
  upsertStations(stations: RwsStation[]): Promise<void>;
  getStations(): Promise<RwsStation[]>;
  setNearestStation(spotId: string, stationId: string): Promise<void>;
  getSpotsWithData(): Promise<SpotWithData[]>;
  getSpotBySlug(slug: string): Promise<SpotWithData | null>;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/**
 * Returns the Supabase-backed store when env vars are configured,
 * otherwise the local JSON store (data/local/) so the app runs without a database.
 */
export async function getStore(): Promise<DataStore> {
  if (hasSupabaseEnv()) {
    const { supabaseStore } = await import("./supabase-store");
    return supabaseStore;
  }
  const { localStore } = await import("./local-store");
  return localStore;
}
