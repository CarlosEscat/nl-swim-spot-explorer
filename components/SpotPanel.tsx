"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SpotLiveData, SpotWithData } from "@/lib/types";
import { aerialImageUrl } from "@/lib/aerial";
import { generatedAccessNotes, localizedAccessNotes } from "@/lib/describe";
import { formatDate, pathFor, t, weatherLabel } from "@/lib/i18n";
import {
  advisoryLabel,
  isUrgentStatus,
  parseAdvisory,
  qualityLabel,
  qualityStyle,
} from "@/lib/quality";
import EuClassBadge from "./EuClassBadge";
import { useI18n } from "./I18nProvider";
import QualityHistoryClient from "./QualityHistoryClient";
import WaterHistory from "./WaterHistory";

function FacilityChip({
  label,
  value,
  unknownTitle,
}: {
  label: string;
  value: boolean | null | undefined;
  unknownTitle: string;
}) {
  const cls =
    value === true
      ? "bg-sky-100 text-sky-900 border-sky-300"
      : value === false
        ? "bg-gray-100 text-gray-400 border-gray-200 line-through"
        : "bg-gray-50 text-gray-400 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
      title={value == null ? unknownTitle : undefined}
    >
      {label}
      {value == null && <span className="ml-1">?</span>}
    </span>
  );
}

export default function SpotPanel({
  spot,
  onClose,
}: {
  spot: SpotWithData;
  onClose: () => void;
}) {
  const { locale, dict } = useI18n();
  const [live, setLive] = useState<SpotLiveData | null>(null);
  const [liveError, setLiveError] = useState(false);

  // The panel is keyed by spot id in Explorer, so state resets by remounting.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/spot/${spot.slug}/live`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: SpotLiveData) => {
        if (!cancelled) setLive(data);
      })
      .catch(() => {
        if (!cancelled) setLiveError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [spot.slug]);

  const q = spot.latest_quality;
  const style = qualityStyle(q?.status);
  const reason = parseAdvisory(q?.raw_notes);
  const d = spot.details;
  const curatedNotes = localizedAccessNotes(d, locale);
  const generatedNotes = curatedNotes ? null : generatedAccessNotes(spot, dict);

  return (
    <aside className="pointer-events-auto flex h-full w-full flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-md sm:rounded-l-2xl">
      <div className="relative">
        <Image
          src={aerialImageUrl(spot.lat, spot.lng, {
            width: 448,
            height: 180,
            spanM: 350,
          })}
          alt={t(dict.panel.aerial_alt, { name: spot.name })}
          width={448}
          height={180}
          className="h-[180px] w-full object-cover sm:rounded-tl-2xl"
        />
        <span className="absolute bottom-1 right-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/90">
          PDOK Luchtfoto CC-BY
        </span>
      </div>
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{spot.name}</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {[
              spot.water_type ? dict.water[spot.water_type] : null,
              spot.municipality,
              spot.province,
            ]
              .filter(Boolean)
              .join(" · ")}
            {spot.is_featured && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {dict.panel.featured}
              </span>
            )}
            {spot.official_status === "unofficial" && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {dict.panel.unofficial_spot}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={dict.panel.close}
          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {/* Top-rated callout */}
        {spot.is_featured && (
          <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
            {spot.eu_classification === "excellent"
              ? t(dict.panel.featured_note_rated, { province: spot.province })
              : dict.panel.featured_note_picked}
          </p>
        )}

        {/* Water quality */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.water_quality}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm font-semibold ${style.badge}`}
            >
              {isUrgentStatus(q?.status) && <span aria-hidden>⚠</span>}
              {qualityLabel(q?.status, dict)}
            </span>
            {reason === "blue_green_algae" && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-violet-700 px-3 py-1 text-sm font-semibold text-white">
                <span aria-hidden>⚠</span> {advisoryLabel(reason, dict)}
              </span>
            )}
            <EuClassBadge
              classification={spot.eu_classification}
              year={spot.eu_classification_year}
              dict={dict}
            />
            <span className="text-xs text-gray-500">
              {q
                ? t(dict.panel.as_of, { date: formatDate(q.measured_at, locale) })
                : spot.official_status === "unofficial"
                  ? dict.panel.not_monitored
                  : dict.panel.no_reading}
            </span>
          </div>
          {reason === "blue_green_algae" && (
            <p className="mt-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
              {dict.advisory.algae_note}{" "}
              <Link
                href={pathFor(locale, "/info/blauwalg")}
                className="font-semibold underline hover:text-violet-700"
              >
                {dict.advisory.algae_more}
              </Link>
            </p>
          )}
          {reason && reason !== "blue_green_algae" && (
            <p className="mt-1.5 text-xs text-gray-500">
              {advisoryLabel(reason, dict)}
            </p>
          )}
          {spot.official_status === "official" && (
            <QualityHistoryClient slug={spot.slug} />
          )}
          {spot.official_status === "unofficial" && (
            <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {dict.panel.unofficial_disclaimer}
            </p>
          )}
        </section>

        {/* Live conditions */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.right_now}
          </h3>
          {liveError ? (
            <p className="mt-1.5 text-sm text-gray-400">
              {dict.live.unavailable}
            </p>
          ) : !live ? (
            <p className="mt-1.5 animate-pulse text-sm text-gray-400">
              {dict.live.loading}
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-sky-50 p-3">
                <div className="text-2xl font-bold text-sky-900">
                  {live.water ? `${live.water.temperature_c.toFixed(1)}°C` : "—"}
                </div>
                <div className="mt-0.5 text-xs text-sky-700">
                  {dict.live.water_temperature}
                  {live.water && (
                    <span className="block text-sky-500">
                      {live.water.distance_km != null &&
                      live.water.distance_km > 1
                        ? t(dict.live.nearest_station, {
                            name:
                              live.water.station_name ?? live.water.station_id,
                            km: live.water.distance_km,
                          })
                        : (live.water.station_name ?? dict.live.on_site)}
                    </span>
                  )}
                </div>
                <WaterHistory slug={spot.slug} />
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="text-2xl font-bold text-amber-900">
                  {live.weather ? `${live.weather.temperature_c.toFixed(0)}°C` : "—"}
                </div>
                <div className="mt-0.5 text-xs text-amber-700">
                  {live.weather ? (
                    <>
                      {weatherLabel(live.weather.weather_code, dict)}
                      <span className="block text-amber-500">
                        {t(dict.live.feels_like, {
                          temp: live.weather.apparent_temperature_c.toFixed(0),
                          wind: Math.round(live.weather.wind_speed_kmh),
                        })}
                      </span>
                    </>
                  ) : (
                    dict.live.weather
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Access & hours */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.access}
          </h3>
          <p className="mt-1.5 text-sm text-gray-700">
            {curatedNotes ?? generatedNotes ?? (
              <span className="text-gray-400">
                {dict.panel.access_default}
              </span>
            )}
          </p>
          {generatedNotes && (
            <p className="mt-1.5 text-[11px] text-gray-400">
              {dict.describe.generated_note}
            </p>
          )}
        </section>

        {/* Facilities */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.facilities}
          </h3>
          {d ? (
            <>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(
                  [
                    ["restrooms", d.has_restrooms],
                    ["catering", d.has_catering],
                    ["parking", d.has_parking],
                    ["lifeguard", d.has_lifeguard],
                    ["boat_ramp", d.has_boat_ramp],
                    ["lounging_area", d.lounging_area],
                    ["nude_recreation", d.nude_recreation],
                    ["dogs_allowed", d.dogs_allowed],
                  ] as const
                ).map(([key, value]) => (
                  <FacilityChip
                    key={key}
                    label={dict.facilities[key]}
                    value={value}
                    unknownTitle={t(dict.facilities.unknown_title, {
                      label: dict.facilities[key],
                    })}
                  />
                ))}
              </div>
              {d.facilities_source === "osm" && (
                <p className="mt-1.5 text-[11px] text-gray-400">
                  {dict.panel.facilities_osm_note}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1.5 text-sm text-gray-400">
              {dict.panel.facilities_missing}
            </p>
          )}
        </section>

        {/* Webcam */}
        {spot.webcam_url && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {dict.panel.webcam}
            </h3>
            <iframe
              src={spot.webcam_url}
              className="mt-2 aspect-video w-full rounded-xl border border-gray-200"
              allow="autoplay"
              title={t(dict.panel.webcam_title, { name: spot.name })}
            />
          </section>
        )}

        <Link
          href={pathFor(locale, `/spots/${spot.slug}`)}
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          {dict.panel.full_page}
        </Link>
      </div>
    </aside>
  );
}
