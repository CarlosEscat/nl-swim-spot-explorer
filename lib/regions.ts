import { CITIES, CITY_RADIUS_KM, type City } from "@/lib/cities";
import { haversineKm } from "@/lib/geo";
import type { Locale } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import type { SwimSpot } from "@/lib/types";

/**
 * Region helpers for the crawlable landing pages (/zwemplekken/[provincie],
 * /zwemmen/[stad]) and the nearby-spots links on spot pages. Provinces are
 * derived from the spot data itself; cities come from lib/cities.ts.
 */

export const provinceSlug = (province: string) => slugify(province);

/** Distinct province names present in the data, alphabetical. */
export function listProvinces(spots: SwimSpot[]): string[] {
  return [...new Set(spots.map((s) => s.province))].sort((a, b) =>
    a.localeCompare(b, "nl")
  );
}

/** Resolve a URL slug ("fryslan") back to the display name ("Fryslân"). */
export function provinceBySlug(
  spots: SwimSpot[],
  slug: string
): string | null {
  return listProvinces(spots).find((p) => provinceSlug(p) === slug) ?? null;
}

export function spotsInProvince<S extends SwimSpot>(
  spots: S[],
  province: string
): S[] {
  return spots
    .filter((s) => s.province === province)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

export interface SpotWithDistance<S extends SwimSpot> {
  spot: S;
  km: number;
}

/** Spots within CITY_RADIUS_KM of a city center, nearest first. */
export function spotsNearCity<S extends SwimSpot>(
  city: City,
  spots: S[]
): SpotWithDistance<S>[] {
  return spots
    .map((spot) => ({
      spot,
      km: haversineKm(city.lat, city.lng, spot.lat, spot.lng),
    }))
    .filter(({ km }) => km <= CITY_RADIUS_KM)
    .sort((a, b) => a.km - b.km);
}

/** The n spots closest to `spot` (excluding itself), nearest first. */
export function nearestSpots<S extends SwimSpot>(
  spot: SwimSpot,
  spots: S[],
  n = 5
): SpotWithDistance<S>[] {
  return spots
    .filter((s) => s.id !== spot.id)
    .map((s) => ({ spot: s, km: haversineKm(spot.lat, spot.lng, s.lat, s.lng) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}

/** Nearest city whose radius covers the spot, for cross-linking; null if none. */
export function cityForSpot(spot: SwimSpot): City | null {
  let best: { city: City; km: number } | null = null;
  for (const city of CITIES) {
    const km = haversineKm(city.lat, city.lng, spot.lat, spot.lng);
    if (km <= CITY_RADIUS_KM && (!best || km < best.km)) best = { city, km };
  }
  return best?.city ?? null;
}

/** Localized city display name (Den Haag → The Hague in English). */
export function cityName(city: City, locale: Locale): string {
  return locale === "en" && city.name_en ? city.name_en : city.name;
}

/** Format a distance like "3.4" (km, one decimal, locale-aware separator). */
export function formatKm(km: number, locale: Locale): string {
  return km.toLocaleString(locale === "nl" ? "nl-NL" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
