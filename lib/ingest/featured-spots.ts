/**
 * Exact PDOK names of the hand-curated, visually featured Amsterdam-area spots.
 * Keys are nameKey() forms so matching survives case/spacing differences.
 */
import { nameKey } from "@/lib/slug";

export const FEATURED_SPOT_NAMES = [
  "Gaasperplas Noord",
  "Gaasperplas Zuid",
  "IJburg", // Strand IJburg / Blijburg
  "Nieuwe Meer Noord",
  "Nieuwe Meer West",
  "Diemerpark",
  "Marineterrein",
  // Het Twiske recreation area
  "Twiske Baaiegat",
  "Twiske Does",
  "Twiske Kure-Jan",
  "Twiske Leers",
  "Twiske Poort",
  "Twiske Schoorlstrand",
  "Twiske Speelsloot",
  "Twiske Vennegatstrand",
];

export const FEATURED_NAME_KEYS = new Set(FEATURED_SPOT_NAMES.map(nameKey));

export function isFeaturedName(name: string): boolean {
  return FEATURED_NAME_KEYS.has(nameKey(name));
}
