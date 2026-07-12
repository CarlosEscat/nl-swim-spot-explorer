import type { QualityStatus } from "@/lib/types";

export interface QualityStyle {
  label: string;
  /** Tailwind classes for the badge */
  badge: string;
  /** Hex used for map pins */
  pin: string;
}

const STYLES: Record<QualityStatus | "unknown", QualityStyle> = {
  good: {
    label: "Good — no active advisories",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    pin: "#10b981",
  },
  acceptable: {
    label: "Acceptable",
    badge: "bg-lime-100 text-lime-800 border-lime-300",
    pin: "#84cc16",
  },
  warning: {
    label: "Warning",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    pin: "#f59e0b",
  },
  negative_advice: {
    label: "Negative swimming advice",
    badge: "bg-orange-100 text-orange-900 border-orange-300",
    pin: "#f97316",
  },
  banned: {
    label: "Swimming banned",
    badge: "bg-red-100 text-red-900 border-red-300",
    pin: "#ef4444",
  },
  unknown: {
    label: "No data",
    badge: "bg-gray-100 text-gray-600 border-gray-300",
    pin: "#9ca3af",
  },
};

export function qualityStyle(status: QualityStatus | null | undefined): QualityStyle {
  return STYLES[status ?? "unknown"] ?? STYLES.unknown;
}
