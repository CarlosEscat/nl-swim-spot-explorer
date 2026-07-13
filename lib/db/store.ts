import type {
  EuClassification,
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
  /**
   * All readings for one spot since `sinceIso` (default: Jan 1 of the current
   * year), ascending by measured_at.
   */
  getQualityHistory(
    spotId: string,
    sinceIso?: string
  ): Promise<WaterQualityReading[]>;
  /** Set (or clear with null) a spot's annual EU bathing-water rating. */
  setEuClassification(
    spotId: string,
    c: { bw_id: string; classification: EuClassification; year: number } | null
  ): Promise<void>;
  getSpotsWithData(): Promise<SpotWithData[]>;
  getSpotBySlug(slug: string): Promise<SpotWithData | null>;
}

/** Default history window: the current calendar year (the bathing season). */
export function defaultQualitySince(): string {
  return `${new Date().getFullYear()}-01-01`;
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
