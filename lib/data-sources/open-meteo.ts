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

/** WMO weather code → short English description (subset relevant to NL). */
export function describeWeatherCode(code: number): string {
  const table: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Violent showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return table[code] ?? "—";
}
