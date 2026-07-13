import type { AdvisoryReason } from "@/lib/quality";
import type { QualityStatus } from "@/lib/types";

// "How good is swimming here right now?" — a pure function so the client can
// rank spots after mixing the cached /api/live payload with the user's
// (never-uploaded) location.

export interface ScoreInput {
  waterTempC: number | null;
  airTempC: number | null;
  weatherCode: number | null;
  windKmh: number | null;
  quality: QualityStatus | null | undefined;
  /** Parsed advisory reason (parseAdvisory), for reason-specific cautions. */
  advisoryReason?: AdvisoryReason | null;
  /** Distance from the user; omit/null when their location is unknown. */
  distanceKm?: number | null;
}

/** Machine codes so callers can localize; never shown to users directly. */
export type CautionCode =
  | "advised_against"
  | "thunderstorms"
  | "rain"
  | "quality_warning"
  | "blue_green_algae";

export interface SpotScore {
  /** 0–100 after all terms; compare only within one ranking run. */
  score: number;
  /** Swimming is officially banned or advised against — never rank these. */
  excluded: boolean;
  /** Penalty notes worth surfacing, as codes for the caller to label. */
  cautions: CautionCode[];
}

/** Piecewise-linear interpolation over [x, y] breakpoints, clamped at the ends. */
function interp(x: number, points: [number, number][]): number {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    if (x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
  return points[points.length - 1][1];
}

export function swimScore(input: ScoreInput): SpotScore {
  const cautions: CautionCode[] = [];

  if (input.quality === "banned" || input.quality === "negative_advice") {
    return { score: 0, excluded: true, cautions: ["advised_against"] };
  }

  let score = 50;

  // Water temperature dominates: a sunny day can't fix 13° water.
  if (input.waterTempC != null) {
    score += interp(input.waterTempC, [
      [10, -30],
      [16, -8],
      [19, 12],
      [22, 30],
      [26, 30],
    ]);
  }

  if (input.airTempC != null) {
    score += interp(input.airTempC, [
      [12, -10],
      [20, 0],
      [26, 10],
    ]);
  }

  const code = input.weatherCode;
  if (code != null) {
    if (code <= 1) score += 10; // clear
    else if (code === 2) score += 6; // partly cloudy
    else if (code === 3) score += 0; // overcast
    else if (code >= 95) {
      score -= 20;
      cautions.push("thunderstorms");
    } else if (code >= 51) {
      score -= 10; // drizzle, rain, showers, snow
      cautions.push("rain");
    } else score -= 4; // fog
  }

  if (input.windKmh != null) {
    score += interp(input.windKmh, [
      [10, 0],
      [30, -6],
      [45, -10],
    ]);
  }

  if (input.quality === "warning") {
    score = Math.min(score, 40);
    cautions.push(
      input.advisoryReason === "blue_green_algae"
        ? "blue_green_algae"
        : "quality_warning"
    );
  }

  score = Math.max(0, Math.min(100, score));

  // Distance decays the score rather than gating it: a great spot 40 km away
  // should still beat a mediocre one around the corner, floor at ×0.4.
  if (input.distanceKm != null) {
    score *= Math.max(0.4, Math.exp(-input.distanceKm / 60));
  }

  return { score, excluded: false, cautions };
}
