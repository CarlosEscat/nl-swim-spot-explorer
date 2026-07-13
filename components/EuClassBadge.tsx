import { t, type Dictionary } from "@/lib/i18n";
import type { EuClassification } from "@/lib/types";

const BADGES: Record<EuClassification, string> = {
  excellent: "bg-sky-100 text-sky-900 border-sky-300",
  good: "bg-emerald-100 text-emerald-900 border-emerald-300",
  sufficient: "bg-amber-100 text-amber-900 border-amber-300",
  poor: "bg-red-100 text-red-900 border-red-300",
  not_classified: "bg-gray-100 text-gray-600 border-gray-300",
};

/**
 * The annual EU bathing-water rating — what the blue signs at official Dutch
 * swim spots show. Distinct from the *current advisory* badge: it's a
 * whole-season verdict, so it always carries its year. Presentational (no
 * hooks), used from both server pages and the client panel — hence dict prop.
 */
export default function EuClassBadge({
  classification,
  year,
  dict,
}: {
  classification: EuClassification | null | undefined;
  year: number | null | undefined;
  dict: Dictionary;
}) {
  if (!classification || !year) return null;
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold ${BADGES[classification]}`}
      title={dict.eu.tooltip}
    >
      {t(dict.eu.label, { year, classification: dict.eu[classification] })}
    </span>
  );
}
