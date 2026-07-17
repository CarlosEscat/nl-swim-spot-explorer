import { t, type Dictionary } from "@/lib/i18n";
import type { SpotWithData } from "@/lib/types";

/**
 * Localized fallback description for official spots without hand-written
 * access notes, composed from structured data the store already has:
 * monitoring status, the annual EU rating and OSM-detected facilities.
 * Returns null when there is nothing sensible to say (unofficial spots
 * without notes keep the generic disclaimer instead).
 */
export function generatedAccessNotes(
  spot: SpotWithData,
  dict: Dictionary
): string | null {
  if (spot.official_status !== "official") return null;

  const parts = [dict.describe.monitored];

  if (
    spot.eu_classification &&
    spot.eu_classification !== "not_classified" &&
    spot.eu_classification_year
  ) {
    parts.push(
      t(dict.describe.eu_rated, {
        year: spot.eu_classification_year,
        classification: dict.eu[spot.eu_classification].toLowerCase(),
      })
    );
  }

  const d = spot.details;
  if (d) {
    const list = (
      [
        ["restrooms", d.has_restrooms],
        ["catering", d.has_catering],
        ["parking", d.has_parking],
        ["lifeguard", d.has_lifeguard],
        ["lounging_area", d.lounging_area],
      ] as const
    )
      .filter(([, v]) => v === true)
      .map(([key]) => dict.facilities[key].toLowerCase());
    if (list.length > 0) {
      parts.push(t(dict.describe.facilities, { list: list.join(", ") }));
    }
  }

  parts.push(dict.describe.open_access);
  return parts.join(" ");
}
