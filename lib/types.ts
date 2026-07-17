/** EEA bathing-water category (specialisedZoneType, minus the suffix). */
export type WaterType = "sea" | "lake" | "river" | "transitional";
export type OfficialStatus = "official" | "delisted" | "unofficial";
export type QualityStatus =
  | "good"
  | "acceptable"
  | "warning"
  | "negative_advice"
  | "banned";

/** Annual EU bathing-water rating (EEA) — the blue signs at official spots. */
export type EuClassification =
  | "excellent"
  | "good"
  | "sufficient"
  | "poor"
  | "not_classified";

export interface SwimSpot {
  id: string;
  name: string;
  slug: string;
  province: string;
  municipality: string | null;
  lat: number;
  lng: number;
  water_type: WaterType | null;
  official_status: OfficialStatus;
  is_featured: boolean;
  nearest_rws_station_id: string | null;
  webcam_url: string | null;
  /** EEA bathing-water identifier (e.g. "NLBW02_9002"); null when unmatched. */
  eu_bw_id?: string | null;
  eu_classification?: EuClassification | null;
  eu_classification_year?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SwimSpotDetails {
  spot_id: string;
  has_restrooms: boolean | null;
  has_catering: boolean | null;
  has_lifeguard: boolean | null;
  has_boat_ramp: boolean | null;
  has_parking?: boolean | null;
  nude_recreation: boolean | null;
  lounging_area: boolean | null;
  access_notes: string | null;
  /** Provenance: 'manual' (hand-curated, authoritative) or 'osm' (auto-detected). */
  facilities_source?: string | null;
  updated_at?: string;
}

export interface WaterQualityReading {
  id?: string;
  spot_id: string;
  measured_at: string; // ISO date
  status: QualityStatus;
  source: string;
  raw_notes: string | null;
  created_at?: string;
}

export interface RwsStation {
  id: string; // RWS location code
  name: string | null;
  lat: number;
  lng: number;
}

/** A spot joined with its latest quality reading and curated details, as the UI consumes it. */
export interface SpotWithData extends SwimSpot {
  details: SwimSpotDetails | null;
  latest_quality: WaterQualityReading | null;
}

export interface LiveWeather {
  temperature_c: number;
  apparent_temperature_c: number;
  wind_speed_kmh: number;
  weather_code: number;
  is_day: boolean;
  fetched_at: string;
}

export interface LiveWaterTemp {
  station_id: string;
  station_name: string | null;
  temperature_c: number;
  measured_at: string;
  /** Distance in km from the spot to the station; null when unknown. */
  distance_km: number | null;
}

export interface SpotLiveData {
  weather: LiveWeather | null;
  water: LiveWaterTemp | null;
}

/** Compact per-spot live snapshot returned by GET /api/live (all spots at once). */
export interface LiveSpotSummary {
  id: string;
  water_temp_c: number | null;
  /** Distance from the spot to its water-temperature station, km. */
  water_station_distance_km: number | null;
  air_temp_c: number | null;
  weather_code: number | null;
  wind_kmh: number | null;
}

export interface LiveSummaryResponse {
  generated_at: string;
  spots: LiveSpotSummary[];
}
