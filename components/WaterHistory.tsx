"use client";

import { useEffect, useState } from "react";
import type { WaterTempHistoryResponse } from "@/app/api/spot/[id]/water-history/route";
import { t } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";
import TempSparkline from "./TempSparkline";

/** Deltas below this read as noise, not a trend. */
const MIN_DELTA_C = 0.3;

/**
 * Lazy sparkline + week-over-week delta for the water-temperature tile.
 * Progressive enhancement: renders nothing while loading, on error, or when
 * the nearest station has no usable history.
 */
export default function WaterHistory({ slug }: { slug: string }) {
  const { dict } = useI18n();
  const [history, setHistory] = useState<WaterTempHistoryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/spot/${slug}/water-history`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: WaterTempHistoryResponse) => {
        if (!cancelled) setHistory(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!history || history.days.length < 3) return null;

  const delta = history.week_delta_c;
  return (
    <div className="mt-1.5 text-sky-600">
      <TempSparkline days={history.days} />
      {delta != null && Math.abs(delta) >= MIN_DELTA_C && (
        <p className="mt-0.5 text-xs font-medium">
          {delta > 0
            ? t(dict.water_history.warmed, { delta: delta.toFixed(1) })
            : t(dict.water_history.cooled, { delta: Math.abs(delta).toFixed(1) })}
        </p>
      )}
    </div>
  );
}
