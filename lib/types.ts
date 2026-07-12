export type WaterType = "fresh" | "salt";
export type OfficialStatus = "official" | "delisted" | "unofficial";
export type QualityStatus =
  | "good"
  | "acceptable"
  | "warning"
  | "negative_advice"
  | "banned";

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
  created_at?: string;
  updated_at?: string;
}

export interface SwimSpotDetails {
  spot_id: string;
  has_restrooms: boolean | null;
  has_catering: boolean | null;
  has_lifeguard: boolean | null;
  has_boat_ramp: boolean | null;
  nude_recreation: boolean | null;
  lounging_area: boolean | null;
  access_notes: string | null;
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
