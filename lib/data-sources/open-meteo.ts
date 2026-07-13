import type { LiveWeather } from "@/lib/types";

/** Current weather at a point via Open-Meteo (no API key). */
export async function fetchCurrentWeather(
  lat: number,
  lng: number
): Promise<LiveWeather | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,is_day&timezone=Europe%2FAmsterdam`;
  // Weather doesn't move faster than this; lets Next cache the upstream call.
  const res = await fetch(url, { next: { revalidate: 1800 } } as RequestInit);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    current?: {
      temperature_2m: number;
      apparent_temperature: number;
      wind_speed_10m: number;
      weather_code: number;
      is_day: number;
      time: string;
    };
  };
  const c = json.current;
  if (!c) return null;
  return {
    temperature_c: c.temperature_2m,
    apparent_temperature_c: c.apparent_temperature,
    wind_speed_kmh: c.wind_speed_10m,
    weather_code: c.weather_code,
    is_day: c.is_day === 1,
    fetched_at: c.time,
  };
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  wind_speed_10m: number;
  weather_code: number;
  is_day: number;
  time: string;
}

function toLiveWeather(c: OpenMeteoCurrent | undefined): LiveWeather | null {
  if (!c) return null;
  return {
    temperature_c: c.temperature_2m,
    apparent_temperature_c: c.apparent_temperature,
    wind_speed_kmh: c.wind_speed_10m,
    weather_code: c.weather_code,
    is_day: c.is_day === 1,
    fetched_at: c.time,
  };
}

/**
 * Current weather for many points in one Open-Meteo call (comma-separated
 * coordinates return an array of results). Chunked to keep URLs sane.
 * Result is index-aligned with the input; failed chunks yield nulls.
 */
export async function fetchCurrentWeatherBatch(
  coords: { lat: number; lng: number }[]
): Promise<(LiveWeather | null)[]> {
  const CHUNK = 100;
  const out: (LiveWeather | null)[] = [];
  for (let i = 0; i < coords.length; i += CHUNK) {
    const chunk = coords.slice(i, i + CHUNK);
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${chunk.map((c) => c.lat.toFixed(4)).join(",")}` +
      `&longitude=${chunk.map((c) => c.lng.toFixed(4)).join(",")}` +
      `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,is_day&timezone=Europe%2FAmsterdam`;
    const res = await fetch(url, { next: { revalidate: 1800 } } as RequestInit);
    if (!res.ok) {
      out.push(...chunk.map(() => null));
      continue;
    }
    const json = (await res.json()) as
      | { current?: OpenMeteoCurrent }
      | { current?: OpenMeteoCurrent }[];
    // A single-coordinate request returns an object instead of an array.
    const list = Array.isArray(json) ? json : [json];
    for (let j = 0; j < chunk.length; j++) {
      out.push(toLiveWeather(list[j]?.current));
    }
  }
  return out;
}

// WMO weather-code descriptions live in the dictionaries (dict.weather);
// use weatherLabel(code, dict) from lib/i18n.
