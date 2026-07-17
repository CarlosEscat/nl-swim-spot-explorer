"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SpotWithData, WaterType } from "@/lib/types";
import { CITIES, CITY_RADIUS_KM } from "@/lib/cities";
import { haversineKm } from "@/lib/geo";
import { parseAdvisory } from "@/lib/quality";
import { useI18n } from "./I18nProvider";
import RankedList from "./RankedList";
import SpotPanel from "./SpotPanel";

function MapLoading() {
  const { dict } = useI18n();
  return (
    <div className="flex h-full w-full items-center justify-center bg-sky-50 text-sky-700">
      {dict.explorer.loading_map}
    </div>
  );
}

// MapLibre touches `window` at import time — client-only.
const SwimMap = dynamic(() => import("./SwimMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function Explorer({ spots }: { spots: SpotWithData[] }) {
  const { locale, dict } = useI18n();
  const [selected, setSelected] = useState<SpotWithData | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hideAlgae, setHideAlgae] = useState(false);
  const [waterType, setWaterType] = useState<WaterType | "">("");
  const [cityId, setCityId] = useState("");
  // Module constant → stable identity for SwimMap's focus effect.
  const city = CITIES.find((c) => c.id === cityId) ?? null;

  // Switching city closes any open spot panel so the camera flight isn't
  // fighting the selection zoom.
  const handleCityChange = (id: string) => {
    setSelected(null);
    setView3d(false);
    setCityId(id);
  };
  const [showRanked, setShowRanked] = useState(false);
  const [view3d, setView3d] = useState(false);

  // Selecting a spot tilts into its 3D view automatically
  const handleSelect = (spot: SpotWithData) => {
    setSelected(spot);
    setView3d(true);
  };

  // Batched with deselection so SwimMap sees selectedId and pitched flip in
  // the same render — two separate renders would fire competing camera
  // animations that cancel each other mid-flight.
  const handleClose = () => {
    setSelected(null);
    setView3d(false);
  };

  const visibleSpots = useMemo(
    () =>
      spots.filter(
        (s) =>
          (!featuredOnly || s.is_featured) &&
          (!waterType || s.water_type === waterType) &&
          (!city ||
            haversineKm(city.lat, city.lng, s.lat, s.lng) <= CITY_RADIUS_KM) &&
          (!hideAlgae ||
            parseAdvisory(s.latest_quality?.raw_notes) !== "blue_green_algae")
      ),
    [spots, featuredOnly, hideAlgae, waterType, city]
  );

  return (
    <div className="relative h-full w-full">
      <SwimMap
        spots={visibleSpots}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
        pitched={view3d}
        focus={city}
      />

      {/* Controls */}
      <div className="absolute left-4 top-4 z-[1000] flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowRanked((v) => !v)}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur ${
            showRanked
              ? "bg-sky-600 text-white"
              : "bg-white/95 text-sky-700 hover:bg-sky-50"
          }`}
        >
          {dict.explorer.best_right_now}
        </button>
        {selected && (
          <button
            onClick={() => setView3d((v) => !v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur ${
              view3d
                ? "bg-sky-600 text-white"
                : "bg-white/95 text-sky-700 hover:bg-sky-50"
            }`}
          >
            {dict.explorer.view_3d}
          </button>
        )}
        <button
          onClick={() => setFeaturedOnly((v) => !v)}
          aria-pressed={featuredOnly}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur ${
            featuredOnly
              ? "bg-indigo-600 text-white"
              : "bg-white/95 text-indigo-700 hover:bg-indigo-50"
          }`}
        >
          {dict.explorer.featured_only}
        </button>
        <select
          value={cityId}
          onChange={(e) => handleCityChange(e.target.value)}
          className="cursor-pointer rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur"
        >
          <option value="">{dict.explorer.city_all}</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "en" ? (c.name_en ?? c.name) : c.name}
            </option>
          ))}
        </select>
        <select
          value={waterType}
          onChange={(e) => setWaterType(e.target.value as WaterType | "")}
          className="cursor-pointer rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur"
        >
          <option value="">{dict.explorer.water_type_all}</option>
          {(["sea", "lake", "river", "transitional"] as const).map((wt) => (
            <option key={wt} value={wt}>
              {dict.water[wt]}
            </option>
          ))}
        </select>
        <button
          onClick={() => setHideAlgae((v) => !v)}
          aria-pressed={hideAlgae}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur ${
            hideAlgae
              ? "bg-violet-600 text-white"
              : "bg-white/95 text-violet-700 hover:bg-violet-50"
          }`}
        >
          {dict.explorer.hide_algae}
        </button>
      </div>

      {/* Ranked "best right now" panel */}
      {showRanked && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 top-1/2 z-[1001] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:top-16 sm:w-96">
          <RankedList
            spots={visibleSpots}
            onSelect={handleSelect}
            onClose={() => setShowRanked(false)}
          />
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        // Mobile: the card covers the bottom 2/3 — a tap anywhere outside it
        // (the visible map strip, including over the controls) closes it.
        <div
          aria-hidden
          className="absolute inset-0 z-[1001] sm:hidden"
          onClick={handleClose}
        />
      )}
      {selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 z-[1002] sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:p-3">
          <SpotPanel
            key={selected.id}
            spot={selected}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}
