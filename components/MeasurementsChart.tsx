"use client";

import { useEffect, useState } from "react";
import type { MeasurementsResponse } from "@/app/api/spot/[id]/measurements/route";
import type { ZwemwaterMeasurement } from "@/lib/data-sources/zwemwater";
import { formatDate, t, type Dictionary, type Locale } from "@/lib/i18n";

/** Lab detection limit: a reported 15 means "<15", the best possible result. */
const DETECTION_LIMIT = 15;

/**
 * EU Bathing Water Directive "excellent" thresholds for inland waters
 * (95th percentile, cfu/100 ml) — shown as a dashed reference line, the same
 * context zwemwater.nl's own charts give.
 */
const EXCELLENT_NORM = { e_coli: 500, enterococci: 200 } as const;

function BarChart({
  series,
  norm,
  title,
  dict,
  locale,
}: {
  series: ZwemwaterMeasurement[];
  norm: number;
  title: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const W = 300;
  const H = 110;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 16;
  const plotH = H - PAD_TOP - PAD_BOTTOM;

  // Log scale: bacterial counts span orders of magnitude, and on a linear
  // scale every in-norm season renders as near-identical slivers. The exact
  // value is printed on every bar, so the compressed scale can't mislead.
  const LOG_FLOOR = 10;
  const maxValue = Math.max(norm * 1.3, ...series.map((m) => m.value * 1.3));
  const frac = (v: number) =>
    Math.log(Math.max(v, LOG_FLOOR) / LOG_FLOOR) / Math.log(maxValue / LOG_FLOOR);
  const y = (v: number) => PAD_TOP + plotH - frac(v) * plotH;
  const slot = W / series.length;
  const barW = Math.min(28, slot * 0.5);

  return (
    <div className="min-w-0 flex-1 sm:px-4 sm:first:pl-0 sm:last:pr-0">
      <p className="text-xs font-semibold text-gray-700">
        {title}{" "}
        <span className="font-normal text-gray-400">
          ({dict.measurements.unit})
        </span>
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 w-full"
        role="img"
        aria-label={`${title}: ${series.map((m) => `${m.date} ${m.value}`).join(", ")}`}
      >
        <line
          x1="0"
          x2={W}
          y1={y(norm)}
          y2={y(norm)}
          stroke="#9ca3af"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <text x={W} y={y(norm) - 3} textAnchor="end" fontSize="8" fill="#9ca3af">
          {dict.measurements.norm} · {norm}
        </text>
        {series.map((m, i) => {
          const cx = slot * i + slot / 2;
          const exceeds = m.value > norm;
          const belowLimit = m.value <= DETECTION_LIMIT;
          // Below-detection-limit bars get a minimum visible height.
          const top = Math.min(y(m.value), PAD_TOP + plotH - 3);
          return (
            <g key={m.date}>
              <rect
                x={cx - barW / 2}
                y={top}
                width={barW}
                height={PAD_TOP + plotH - top}
                rx="2"
                fill={exceeds ? "#dc2626" : "#0284c7"}
                opacity={belowLimit ? 0.45 : 0.9}
              />
              <text
                x={cx}
                y={top - 3}
                textAnchor="middle"
                fontSize="8"
                fill={exceeds ? "#dc2626" : "#374151"}
              >
                {belowLimit ? `<${DETECTION_LIMIT}` : m.value}
              </text>
              <text
                x={cx}
                y={H - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#9ca3af"
              >
                {formatDate(m.date, locale, { day: "numeric", month: "short" })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Current-season bacteriological measurements, the same data behind
 * zwemwater.nl's "Meetgegevens" tab. Progressive enhancement: renders
 * nothing while loading, on error, or for spots without a zwemwater.nl match.
 */
export default function MeasurementsChart({
  slug,
  dict,
  locale,
}: {
  slug: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const [data, setData] = useState<MeasurementsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/spot/${slug}/measurements`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: MeasurementsResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!data || (data.e_coli.length === 0 && data.enterococci.length === 0)) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {dict.measurements.title}
      </h3>
      <div className="mt-2 flex flex-col gap-4 divide-y divide-gray-200 sm:flex-row sm:gap-0 sm:divide-x sm:divide-y-0">
        {data.e_coli.length > 0 && (
          <BarChart
            series={data.e_coli}
            norm={EXCELLENT_NORM.e_coli}
            title={dict.measurements.e_coli}
            dict={dict}
            locale={locale}
          />
        )}
        {data.enterococci.length > 0 && (
          <BarChart
            series={data.enterococci}
            norm={EXCELLENT_NORM.enterococci}
            title={dict.measurements.enterococci}
            dict={dict}
            locale={locale}
          />
        )}
      </div>
      <p className="mt-1.5 text-xs text-gray-400">
        {t(dict.measurements.source_note, { limit: DETECTION_LIMIT })}{" "}
        {data.zwemwater_url && (
          <a
            href={data.zwemwater_url}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-600"
          >
            zwemwater.nl
          </a>
        )}
      </p>
    </div>
  );
}
