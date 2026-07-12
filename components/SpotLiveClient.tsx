"use client";

import { useEffect, useState } from "react";
import type { SpotLiveData } from "@/lib/types";
import { describeWeatherCode } from "@/lib/data-sources/open-meteo";

/** Client-side live-conditions block for the static spot pages (SSG + live overlay). */
export default function SpotLiveClient({ slug }: { slug: string }) {
  const [live, setLive] = useState<SpotLiveData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/spot/${slug}/live`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setLive)
      .catch(() => setFailed(true));
  }, [slug]);

  if (failed) {
    return <p className="text-sm text-gray-400">Live conditions unavailable.</p>;
  }
  if (!live) {
    return (
      <p className="animate-pulse text-sm text-gray-400">
        Loading live conditions…
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-sky-50 p-4">
        <div className="text-3xl font-bold text-sky-900">
          {live.water ? `${live.water.temperature_c.toFixed(1)}°C` : "—"}
        </div>
        <div className="mt-1 text-sm text-sky-700">
          Water temperature
          {live.water && (
            <span className="block text-xs text-sky-500">
              {live.water.distance_km != null && live.water.distance_km > 1
                ? `nearest station: ${live.water.station_name ?? live.water.station_id} (${live.water.distance_km} km away)`
                : (live.water.station_name ?? "on-site sensor")}
              {" · "}
              {new Date(live.water.measured_at).toLocaleString("en-NL", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
      <div className="rounded-xl bg-amber-50 p-4">
        <div className="text-3xl font-bold text-amber-900">
          {live.weather ? `${live.weather.temperature_c.toFixed(0)}°C` : "—"}
        </div>
        <div className="mt-1 text-sm text-amber-700">
          {live.weather ? (
            <>
              {describeWeatherCode(live.weather.weather_code)}
              <span className="block text-xs text-amber-500">
                feels like {live.weather.apparent_temperature_c.toFixed(0)}°C ·
                wind {Math.round(live.weather.wind_speed_kmh)} km/h
              </span>
            </>
          ) : (
            "Weather"
          )}
        </div>
      </div>
    </div>
  );
}
