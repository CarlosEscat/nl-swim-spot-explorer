"use client";

import { useEffect, useMemo, useState } from "react";
import { describeWeatherCode } from "@/lib/data-sources/open-meteo";
import { haversineKm } from "@/lib/geo";
import { qualityStyle } from "@/lib/quality";
import { swimScore } from "@/lib/score";
import type {
  LiveSpotSummary,
  LiveSummaryResponse,
  SpotWithData,
} from "@/lib/types";

const TOP_N = 15;

interface RankedEntry {
  spot: SpotWithData;
  live: LiveSpotSummary | undefined;
  score: number;
  excluded: boolean;
  cautions: string[];
  distanceKm: number | null;
}

export default function RankedList({
  spots,
  onSelect,
  onClose,
}: {
  spots: SpotWithData[];
  onSelect: (spot: SpotWithData) => void;
  onClose: () => void;
}) {
  const [live, setLive] = useState<Map<string, LiveSpotSummary> | null>(null);
  const [liveError, setLiveError] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(
    null
  );
  // Only rendered post-hydration (behind a user toggle), so navigator exists.
  const [geoDenied, setGeoDenied] = useState<boolean>(
    () => typeof navigator !== "undefined" && !navigator.geolocation
  );

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled)
            setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          if (!cancelled) setGeoDenied(true);
        },
        { maximumAge: 600_000, timeout: 10_000 }
      );
    }
    return () => {
      cancelled = true;
    };
  }, []);

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
          <h2 className="text-base font-bold text-gray-900">Best right now</h2>
          <p className="text-xs text-gray-500">
            {userLoc
              ? "Ranked by conditions and distance to you"
              : geoDenied
                ? "Ranked by conditions — enable location for nearby picks"
                : "Ranked by conditions…"}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close ranking"
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
            Live conditions unavailable right now.
          </p>
        ) : !live ? (
          <p className="animate-pulse p-4 text-sm text-gray-400">
            Fetching live conditions for {spots.length} spots…
          </p>
        ) : (
          <ol>
            {ranked.map((entry, i) => {
              const style = qualityStyle(entry.spot.latest_quality?.status);
              const parts = [
                entry.live?.water_temp_c != null
                  ? `${entry.live.water_temp_c.toFixed(1)}° water`
                  : null,
                entry.live?.air_temp_c != null
                  ? `${describeWeatherCode(entry.live.weather_code ?? -1)} ${entry.live.air_temp_c.toFixed(0)}°`
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
                          title={style.label}
                        />
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {entry.spot.name}
                        </span>
                        {entry.spot.official_status === "unofficial" && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-700">
                            unofficial
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {parts.join(" · ") || "no live data"}
                        {entry.spot.municipality && ` · ${entry.spot.municipality}`}
                      </span>
                      {entry.cautions.length > 0 && (
                        <span className="block text-xs font-medium text-amber-600">
                          ⚠ {entry.cautions.join(", ")}
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
