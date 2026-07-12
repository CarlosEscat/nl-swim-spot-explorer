"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SpotLiveData, SpotWithData } from "@/lib/types";
import { aerialImageUrl } from "@/lib/aerial";
import { qualityStyle } from "@/lib/quality";
import { describeWeatherCode } from "@/lib/data-sources/open-meteo";

function FacilityChip({
  label,
  value,
}: {
  label: string;
  value: boolean | null | undefined;
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
      title={value == null ? `${label}: unknown` : undefined}
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
  const d = spot.details;

  return (
    <aside className="pointer-events-auto flex h-full w-full flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-md sm:rounded-l-2xl">
      <div className="relative">
        <Image
          src={aerialImageUrl(spot.lat, spot.lng, {
            width: 448,
            height: 180,
            spanM: 350,
          })}
          alt={`Aerial photo of ${spot.name}`}
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
            {[spot.municipality, spot.province].filter(Boolean).join(", ")}
            {spot.is_featured && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                Featured
              </span>
            )}
            {spot.official_status === "unofficial" && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Unofficial spot
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
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
        {/* Water quality */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Water quality
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold ${style.badge}`}
            >
              {style.label}
            </span>
            <span className="text-xs text-gray-500">
              {q
                ? `as of ${new Date(q.measured_at).toLocaleDateString("en-NL", { day: "numeric", month: "short", year: "numeric" })}`
                : spot.official_status === "unofficial"
                  ? "not monitored"
                  : "no reading yet"}
            </span>
          </div>
          {q?.raw_notes && (
            <p className="mt-1.5 text-xs text-gray-500">{q.raw_notes}</p>
          )}
          {spot.official_status === "unofficial" && (
            <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This is not an officially designated swimming location. Water
              quality is not tested by zwemwater.nl and there is no supervision
              — swim at your own risk.
            </p>
          )}
        </section>

        {/* Live conditions */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Right now
          </h3>
          {liveError ? (
            <p className="mt-1.5 text-sm text-gray-400">
              Live conditions unavailable.
            </p>
          ) : !live ? (
            <p className="mt-1.5 animate-pulse text-sm text-gray-400">
              Loading live conditions…
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-sky-50 p-3">
                <div className="text-2xl font-bold text-sky-900">
                  {live.water ? `${live.water.temperature_c.toFixed(1)}°C` : "—"}
                </div>
                <div className="mt-0.5 text-xs text-sky-700">
                  Water temperature
                  {live.water && (
                    <span className="block text-sky-500">
                      {live.water.distance_km != null &&
                      live.water.distance_km > 1
                        ? `nearest station: ${live.water.station_name ?? live.water.station_id} (${live.water.distance_km} km away)`
                        : (live.water.station_name ?? "on-site sensor")}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="text-2xl font-bold text-amber-900">
                  {live.weather ? `${live.weather.temperature_c.toFixed(0)}°C` : "—"}
                </div>
                <div className="mt-0.5 text-xs text-amber-700">
                  {live.weather ? (
                    <>
                      {describeWeatherCode(live.weather.weather_code)}
                      <span className="block text-amber-500">
                        feels like {live.weather.apparent_temperature_c.toFixed(0)}
                        °C · wind {Math.round(live.weather.wind_speed_kmh)} km/h
                      </span>
                    </>
                  ) : (
                    "Weather"
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Access & hours */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Access &amp; hours
          </h3>
          <p className="mt-1.5 text-sm text-gray-700">
            {d?.access_notes ?? (
              <span className="text-gray-400">
                Not curated yet — most official spots are open-access.
              </span>
            )}
          </p>
        </section>

        {/* Facilities */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Facilities
          </h3>
          {d ? (
            <>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FacilityChip label="Restrooms" value={d.has_restrooms} />
                <FacilityChip label="Food & drinks" value={d.has_catering} />
                <FacilityChip label="Parking" value={d.has_parking} />
                <FacilityChip label="Lifeguard" value={d.has_lifeguard} />
                <FacilityChip label="Boat ramp" value={d.has_boat_ramp} />
                <FacilityChip label="Lounging area" value={d.lounging_area} />
                <FacilityChip label="Nude recreation" value={d.nude_recreation} />
              </div>
              {d.facilities_source === "osm" && (
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Facilities auto-detected from OpenStreetMap (within ~300 m).
                </p>
              )}
            </>
          ) : (
            <p className="mt-1.5 text-sm text-gray-400">
              Facilities not curated for this spot yet.
            </p>
          )}
        </section>

        {/* Webcam */}
        {spot.webcam_url && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Live camera
            </h3>
            <iframe
              src={spot.webcam_url}
              className="mt-2 aspect-video w-full rounded-xl border border-gray-200"
              allow="autoplay"
              title={`Live camera at ${spot.name}`}
            />
          </section>
        )}

        <Link
          href={`/spots/${spot.slug}`}
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Full page &amp; details →
        </Link>
      </div>
    </aside>
  );
}
