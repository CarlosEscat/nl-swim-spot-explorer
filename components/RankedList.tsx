"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { haversineKm } from "@/lib/geo";
import { t, weatherLabel } from "@/lib/i18n";
import { parseAdvisory, qualityLabel, qualityStyle } from "@/lib/quality";
import { swimScore, type CautionCode } from "@/lib/score";
import type {
  LiveSpotSummary,
  LiveSummaryResponse,
  SpotWithData,
} from "@/lib/types";
import { useI18n } from "./I18nProvider";

const TOP_N = 15;

type GeoStatus =
  | "unsupported"
  | "idle"
  | "locating"
  | "granted"
  | "denied"
  | "error";

// Remembered opt-out. Browser permission can't be revoked from script, so
// this is what stops us re-using an already-granted permission on every open.
const GEO_STORAGE_KEY = "zwemstek:location";

interface RankedEntry {
  spot: SpotWithData;
  live: LiveSpotSummary | undefined;
  score: number;
  excluded: boolean;
  cautions: CautionCode[];
  distanceKm: number | null;
}

export default function RankedList({
  spots,
  onSelect,
  onClose,
  onClearFilters,
}: {
  spots: SpotWithData[];
  onSelect: (spot: SpotWithData) => void;
  onClose: () => void;
  /** Provided only while filters are active — offers a way out of an empty list. */
  onClearFilters?: () => void;
}) {
  const { dict } = useI18n();
  const [live, setLive] = useState<Map<string, LiveSpotSummary> | null>(null);
  const [liveError, setLiveError] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(
    null
  );
  // Location is opt-in: we never call getCurrentPosition (which is what
  // triggers the browser prompt) until the user asks for it, or unless
  // permission was already granted in an earlier session.
  // Only rendered post-hydration (behind a user toggle), so navigator exists.
  const [geoStatus, setGeoStatus] = useState<GeoStatus>(() =>
    typeof navigator !== "undefined" && !navigator.geolocation
      ? "unsupported"
      : "idle"
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
        try {
          window.localStorage.removeItem(GEO_STORAGE_KEY);
        } catch {
          // Storage unavailable — the toggle still works for this session.
        }
      },
      (err) => {
        // A hard block resolves here with no prompt shown, so the denied copy
        // has to point at the browser setting or the button looks broken.
        setGeoStatus(
          err.code === err.PERMISSION_DENIED ? "denied" : "error"
        );
      },
      { maximumAge: 600_000, timeout: 10_000 }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/live")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: LiveSummaryResponse) => {
        if (!cancelled)
          setLive(new Map(data.spots.map((s) => [s.id, s])));
      })
      .catch(() => {
        if (!cancelled) setLiveError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const disableLocation = () => {
    setUserLoc(null);
    setGeoStatus("idle");
    try {
      window.localStorage.setItem(GEO_STORAGE_KEY, "off");
    } catch {
      // Storage unavailable — the opt-out still holds for this session.
    }
  };

  // Already granted in a previous session (and not opted out)? Use it — that
  // shows no prompt, so it costs nothing and saves a pointless click.
  // Permissions API support for geolocation is uneven; failure leaves the button.
  useEffect(() => {
    let cancelled = false;
    if (window.localStorage.getItem(GEO_STORAGE_KEY) === "off") return;
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (!cancelled && status.state === "granted") requestLocation();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  const ranked = useMemo<RankedEntry[]>(() => {
    if (!live) return [];
    return spots
      .map((spot) => {
        const l = live.get(spot.id);
        const distanceKm = userLoc
          ? haversineKm(userLoc.lat, userLoc.lng, spot.lat, spot.lng)
          : null;
        const s = swimScore({
          waterTempC: l?.water_temp_c ?? null,
          airTempC: l?.air_temp_c ?? null,
          weatherCode: l?.weather_code ?? null,
          windKmh: l?.wind_kmh ?? null,
          quality: spot.latest_quality?.status,
          advisoryReason: parseAdvisory(spot.latest_quality?.raw_notes),
          distanceKm,
        });
        return { spot, live: l, score: s.score, cautions: s.cautions, excluded: s.excluded, distanceKm };
      })
      .filter((e) => !e.excluded)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N);
  }, [spots, live, userLoc]);

  return (
    <aside className="pointer-events-auto flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {dict.ranked.title}
          </h2>
          <p className="text-xs text-gray-500">
            {userLoc
              ? dict.ranked.subtitle_located
              : dict.ranked.subtitle_idle}
          </p>
          {/* Location is always visibly on or off — never silently used.
              Turning it off can't revoke the browser permission, so the
              choice is remembered to stop us re-using it on the next open. */}
          {userLoc && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sky-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-sky-700">
              {dict.ranked.location_on}
              <button
                onClick={disableLocation}
                aria-label={dict.ranked.location_disable}
                className="rounded-full p-0.5 text-sky-500 hover:bg-sky-100 hover:text-sky-800"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path
                    d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          )}
          {/* Opt-in location. Stays available after a failure so a user who
              unblocks the site in their browser can retry. */}
          {!userLoc && geoStatus !== "unsupported" && (
            <>
              <button
                onClick={requestLocation}
                disabled={geoStatus === "locating"}
                className="mt-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-60"
              >
                {geoStatus === "locating"
                  ? dict.ranked.locating
                  : dict.ranked.use_location}
              </button>
              {(geoStatus === "denied" || geoStatus === "error") && (
                <p className="mt-1 text-[11px] text-amber-700">
                  {geoStatus === "denied"
                    ? dict.ranked.location_denied
                    : dict.ranked.location_error}
                </p>
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label={dict.ranked.close}
          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {liveError ? (
          <p className="p-4 text-sm text-gray-400">
            {dict.ranked.live_unavailable}
          </p>
        ) : !live ? (
          <p className="animate-pulse p-4 text-sm text-gray-400">
            {t(dict.ranked.fetching, { count: spots.length })}
          </p>
        ) : ranked.length === 0 ? (
          // Empty for two different reasons: filters left nothing to rank, or
          // everything left is advised against. Say which.
          <div className="p-4">
            <p className="text-sm text-gray-500">
              {spots.length === 0
                ? dict.ranked.empty_filtered
                : dict.ranked.empty_excluded}
            </p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="mt-2 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
              >
                {dict.explorer.clear_filters}
              </button>
            )}
          </div>
        ) : (
          <ol>
            {ranked.map((entry, i) => {
              const style = qualityStyle(entry.spot.latest_quality?.status);
              const parts = [
                entry.live?.water_temp_c != null
                  ? t(dict.ranked.water_part, {
                      temp: entry.live.water_temp_c.toFixed(1),
                    })
                  : null,
                entry.live?.air_temp_c != null
                  ? `${weatherLabel(entry.live.weather_code ?? -1, dict)} ${entry.live.air_temp_c.toFixed(0)}°`
                  : null,
                entry.distanceKm != null
                  ? `${Math.round(entry.distanceKm)} km`
                  : null,
              ].filter(Boolean);
              return (
                <li key={entry.spot.id}>
                  <button
                    onClick={() => onSelect(entry.spot)}
                    className="flex w-full items-start gap-3 border-b border-gray-50 px-4 py-2.5 text-left hover:bg-sky-50"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-sm font-bold text-sky-600">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: style.pin }}
                          title={qualityLabel(
                            entry.spot.latest_quality?.status,
                            dict
                          )}
                        />
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {entry.spot.name}
                        </span>
                        {entry.spot.official_status === "unofficial" && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-700">
                            {dict.ranked.unofficial}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {parts.join(" · ") || dict.ranked.no_live_data}
                        {entry.spot.municipality && ` · ${entry.spot.municipality}`}
                      </span>
                      {entry.cautions.length > 0 && (
                        <span className="block text-xs font-medium text-amber-600">
                          ⚠ {entry.cautions.map((c) => dict.cautions[c]).join(", ")}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}
