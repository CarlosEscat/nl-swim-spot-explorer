import type { DailyWaterTemp } from "@/lib/data-sources/rws-ddl";

/**
 * Tiny inline-SVG sparkline of daily average water temperature. Presentational
 * only (no hooks) so it renders from both server and client components.
 */
export default function TempSparkline({ days }: { days: DailyWaterTemp[] }) {
  if (days.length < 3) return null;

  const values = days.map((d) => d.avg_c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Flat series still needs a visible line — pad the domain a bit.
  const lo = min - Math.max(0.2, (max - min) * 0.15);
  const hi = max + Math.max(0.2, (max - min) * 0.15);

  const W = 100;
  const H = 28;
  const x = (i: number) => (i / (days.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const area = `0,${H} ${points.join(" ")} ${W},${H}`;

  return (
    <div className="flex items-end gap-1.5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-8 w-full min-w-0"
        role="img"
        aria-label={`Water temperature, last ${days.length} days: ${min.toFixed(1)} to ${max.toFixed(1)}°C`}
      >
        <polygon points={area} fill="currentColor" opacity="0.12" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex shrink-0 flex-col text-right text-[9px] leading-tight opacity-70">
        <span>{max.toFixed(1)}°</span>
        <span>{min.toFixed(1)}°</span>
      </div>
    </div>
  );
}
