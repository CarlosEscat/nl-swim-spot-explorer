"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SpotWithData } from "@/lib/types";
import RankedList from "./RankedList";
import SpotPanel from "./SpotPanel";

// MapLibre touches `window` at import time — client-only.
const SwimMap = dynamic(() => import("./SwimMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-sky-50 text-sky-700">
      Loading map…
    </div>
  ),
});

export default function Explorer({ spots }: { spots: SpotWithData[] }) {
  const [selected, setSelected] = useState<SpotWithData | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showRanked, setShowRanked] = useState(false);
  const [view3d, setView3d] = useState(false);

  // Flatten the camera again once no spot is selected
  useEffect(() => {
    if (!selected) setView3d(false);
  }, [selected]);

  const visibleSpots = useMemo(
    () => (featuredOnly ? spots.filter((s) => s.is_featured) : spots),
    [spots, featuredOnly]
  );

  return (
    <div className="relative h-full w-full">
      <SwimMap
        spots={visibleSpots}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        pitched={view3d}
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
          🏊 Best right now
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
            🏙️ 3D view
          </button>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          Amsterdam featured only
        </label>
      </div>

      {/* Ranked "best right now" panel */}
      {showRanked && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 top-1/2 z-[1001] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:top-16 sm:w-96">
          <RankedList
            spots={spots}
            onSelect={setSelected}
            onClose={() => setShowRanked(false)}
          />
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 z-[1002] sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:p-3">
          <SpotPanel
            key={selected.id}
            spot={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
