import type { Dictionary } from "@/lib/i18n";
import type { QualityStatus } from "@/lib/types";

export interface QualityStyle {
  /** Tailwind classes for the badge */
  badge: string;
  /** Hex used for map pins */
  pin: string;
}

const STYLES: Record<QualityStatus | "unknown", QualityStyle> = {
  good: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    pin: "#10b981",
  },
  acceptable: {
    badge: "bg-lime-100 text-lime-800 border-lime-300",
    pin: "#84cc16",
  },
  // Solid fill, not the pastel treatment the calmer statuses use — these two
  // are active warnings and should read as more urgent at a glance.
  warning: {
    badge: "bg-amber-700 text-white border-transparent",
    pin: "#f59e0b",
  },
  negative_advice: {
    badge: "bg-orange-700 text-white border-transparent",
    pin: "#f97316",
  },
  banned: {
    badge: "bg-red-100 text-red-900 border-red-300",
    pin: "#ef4444",
  },
  unknown: {
    badge: "bg-gray-100 text-gray-600 border-gray-300",
    pin: "#9ca3af",
  },
};

export function qualityStyle(status: QualityStatus | null | undefined): QualityStyle {
  return STYLES[status ?? "unknown"] ?? STYLES.unknown;
}

/** Active-advisory statuses that get the bold ⚠ badge treatment. */
export function isUrgentStatus(status: QualityStatus | null | undefined): boolean {
  return status === "warning" || status === "negative_advice";
}

/** Localized label for a quality status ("No data" when absent). */
export function qualityLabel(
  status: QualityStatus | null | undefined,
  dict: Dictionary
): string {
  return dict.quality[status ?? "unknown"] ?? dict.quality.unknown;
}

/** Structured reason behind an advisory, derived from a reading's raw_notes. */
export type AdvisoryReason =
  | "blue_green_algae"
  | "swimmers_itch"
  | "water_quality"
  | "unsafe_situation"
  | "special_circumstance"
  | "other";

/**
 * raw_notes is always "<STATUS>: <REASON>" from zwemwater.nl
 * (e.g. "WAARSCHUWING: WAARSCHUWING_BLAUWALG"). Substring match — reason
 * codes vary by severity prefix (WAARSCHUWING_/ONTRADEN_/VERBOD_).
 */
export function parseAdvisory(
  rawNotes: string | null | undefined
): AdvisoryReason | null {
  if (!rawNotes) return null;
  if (rawNotes.includes("BLAUWALG")) return "blue_green_algae";
  if (rawNotes.includes("ZWEMMERSJEUK")) return "swimmers_itch";
  if (rawNotes.includes("KWALITEIT") || rawNotes.includes("NORMOVERSCHRIJDING"))
    return "water_quality";
  if (rawNotes.includes("ONVEILIGE_SITUATIE")) return "unsafe_situation";
  if (rawNotes.includes("BIJZONDERE_OMSTANDIGHEID"))
    return "special_circumstance";
  return "other";
}

/** Localized label for an advisory reason. */
export function advisoryLabel(reason: AdvisoryReason, dict: Dictionary): string {
  return dict.advisory[reason];
}
