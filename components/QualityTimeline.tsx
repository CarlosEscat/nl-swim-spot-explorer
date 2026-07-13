import type { Dictionary } from "@/lib/i18n";
import { advisoryLabel, parseAdvisory, qualityLabel, qualityStyle } from "@/lib/quality";
import type { WaterQualityReading } from "@/lib/types";

/**
 * Horizontal strip of this season's official quality readings (May 1–Oct 1).
 * Each reading colors the span until the next one; gray before the first
 * reading and after today. Presentational (no hooks) so it renders from both
 * the server spot page and the client map panel — hence the dict prop.
 */
export default function QualityTimeline({
  readings,
  dict,
}: {
  readings: WaterQualityReading[];
  dict: Dictionary;
}) {
  // Monthly snapshots only started recently; a one-reading strip would imply
  // more certainty than we have.
  if (readings.length < 2) return null;

  const sorted = [...readings].sort((a, b) =>
    a.measured_at < b.measured_at ? -1 : 1
  );
  // Season window of the year being measured — derived from the data (not the
  // clock) so rendering stays pure.
  const year = Number(sorted[sorted.length - 1].measured_at.slice(0, 4));
  const from = Date.parse(`${year}-05-01T00:00:00Z`);
  const to = Date.parse(`${year}-10-01T00:00:00Z`);
  // A monthly snapshot plausibly covers ~a month past its date.
  const lastCovered = Math.min(
    Date.parse(`${sorted[sorted.length - 1].measured_at}T00:00:00Z`) +
      31 * 24 * 3600 * 1000,
    to
  );
  const pos = (t: number) =>
    Math.min(100, Math.max(0, ((t - from) / (to - from)) * 100));
  const segments = sorted
    .map((r, i) => {
      const start = Date.parse(`${r.measured_at}T00:00:00Z`);
      const end =
        i + 1 < sorted.length
          ? Date.parse(`${sorted[i + 1].measured_at}T00:00:00Z`)
          : lastCovered;
      const reason = parseAdvisory(r.raw_notes);
      return {
        key: r.measured_at,
        left: pos(start),
        width: Math.max(0, pos(end) - pos(start)),
        color: qualityStyle(r.status).pin,
        title: `${r.measured_at}: ${qualityLabel(r.status, dict)}${reason ? ` — ${advisoryLabel(reason, dict)}` : ""}`,
      };
    })
    .filter((s) => s.width > 0);
  if (segments.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-100">
        {segments.map((s) => (
          <div
            key={s.key}
            className="absolute inset-y-0"
            style={{ left: `${s.left}%`, width: `${s.width}%`, background: s.color }}
            title={s.title}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-gray-400">
        {dict.timeline.months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
