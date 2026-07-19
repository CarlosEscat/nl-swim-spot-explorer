"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
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

// The ?spot= deep-link param never changes while mounted (in-app navigation
// uses replaceState on close), so the subscription is a no-op.
const noopSubscribe = () => () => {};
const readDeepLinkSlug = () =>
  new URLSearchParams(window.location.search).get("spot");
const serverDeepLinkSlug = () => null;

// Remembered 3D preference. Only read/written on user interaction and in a
// lazy state initializer, so SSR never touches it.
const VIEW3D_STORAGE_KEY = "zwemstek:view3d";

export default function Explorer({ spots }: { spots: SpotWithData[] }) {
  const { locale, dict } = useI18n();
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hideAlgae, setHideAlgae] = useState(false);
  const [waterType, setWaterType] = useState<WaterType | "">("");
  const [cityId, setCityId] = useState("");
  const [showRanked, setShowRanked] = useState(false);
  // Mobile-only disclosure for the filter cluster; desktop always shows it inline.
  const [showFilters, setShowFilters] = useState(false);
  // Module constant → stable identity for SwimMap's focus effect.
  const city = CITIES.find((c) => c.id === cityId) ?? null;

  // Deep link: /?spot=<slug> opens that spot's panel — this is how the detail
  // page's "back to the map" link restores the selection. It only applies
  // until the first explicit interaction (select/close/city change).
  const deepLinkSlug = useSyncExternalStore(
    noopSubscribe,
    readDeepLinkSlug,
    serverDeepLinkSlug
  );
  const deepLinkSpot = useMemo(
    () => (deepLinkSlug ? spots.find((s) => s.slug === deepLinkSlug) : null),
    [deepLinkSlug, spots]
  );

  // Selection + 3D tilt live in one state object so SwimMap sees both flip in
  // the same render — two separate renders would fire competing camera
  // animations that cancel each other mid-flight. null = no interaction yet,
  // which lets the deep link (if any) drive the initial selection.
  const [interaction, setInteraction] = useState<{
    spot: SpotWithData | null;
    tilt: boolean;
  } | null>(null);
  // Remembered across selections (and sessions): tilting is the default
  // delight, but once the user opts out of 3D we respect that choice.
  const [prefer3d, setPrefer3d] = useState<boolean>(
    () =>
      typeof window === "undefined" ||
      window.localStorage.getItem(VIEW3D_STORAGE_KEY) !== "off"
  );

  const selected = interaction ? interaction.spot : (deepLinkSpot ?? null);
  const view3d = interaction
    ? interaction.tilt
    : deepLinkSpot != null && prefer3d;

  // Selecting a spot tilts into its 3D view if the user hasn't opted out
  const handleSelect = (spot: SpotWithData) => {
    setInteraction({ spot, tilt: prefer3d });
  };

  const handleTiltToggle = () => {
    const next = !view3d;
    setPrefer3d(next);
    try {
      window.localStorage.setItem(VIEW3D_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Storage unavailable (private mode etc.) — the toggle still works.
    }
    if (selected) setInteraction({ spot: selected, tilt: next });
  };

  // On mobile the ranked sheet stacks above the spot card, so close it after
  // a pick to reveal the card. Desktop shows them side by side — keep it open.
  const handleRankedSelect = (spot: SpotWithData) => {
    handleSelect(spot);
    if (window.matchMedia("(max-width: 639px)").matches) {
      setShowRanked(false);
    }
  };

  // Stable identity so the Escape-key effect doesn't re-subscribe per render.
  const handleClose = useCallback(() => {
    setInteraction({ spot: null, tilt: false });
    // Drop a ?spot= deep-link param so a reload doesn't reopen the panel.
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Escape closes the topmost layer: the spot card first, then the ranked
  // list, then the mobile filter disclosure.
  useEffect(() => {
    if (!selected && !showRanked && !showFilters) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (selected) handleClose();
      else if (showRanked) setShowRanked(false);
      else setShowFilters(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, showRanked, showFilters, handleClose]);

  // Switching city closes any open spot panel so the camera flight isn't
  // fighting the selection zoom.
  const handleCityChange = (id: string) => {
    setInteraction({ spot: null, tilt: false });
    setCityId(id);
  };

  const activeFilterCount = [featuredOnly, hideAlgae, waterType !== "", cityId !== ""]
    .filter(Boolean).length;

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

      {/* Controls — on mobile they stack above the tap-to-close overlay and the
          spot card, so the toolbar keeps working while a card is open. */}
      <div className="absolute left-4 top-4 z-[1003] flex flex-wrap items-center gap-2 sm:z-[1000]">
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
            onClick={handleTiltToggle}
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
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-controls="map-filters"
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur sm:hidden ${
            showFilters
              ? "bg-gray-900 text-white"
              : "bg-white/95 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {dict.explorer.filters}
          {activeFilterCount > 0 && (
            <span
              className={`rounded-full px-1.5 text-xs font-bold ${
                showFilters ? "bg-white/25" : "bg-sky-600 text-white"
              }`}
            >
              {activeFilterCount}
            </span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          id="map-filters"
          className={`${
            showFilters ? "filters-pop flex" : "hidden"
          } w-full flex-wrap items-center gap-2 sm:contents`}
        >
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
      </div>

      {/* Ranked "best right now" panel — on mobile it sits above the spot card
          (selecting an entry closes it via handleRankedSelect). */}
      {showRanked && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 top-1/2 z-[1003] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:top-16 sm:z-[1001] sm:w-96">
          <RankedList
            spots={visibleSpots}
            onSelect={handleRankedSelect}
            onClose={() => setShowRanked(false)}
          />
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        // Mobile: the card covers the bottom 2/3 — a tap on the visible map
        // strip closes it. The toolbar sits above this overlay, so its
        // controls keep working; only the card's ✕ or a map tap dismisses.
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
