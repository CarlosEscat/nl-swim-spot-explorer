"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SpotWithData } from "@/lib/types";
import SpotPanel from "./SpotPanel";

// Leaflet touches `window` at import time — client-only.
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
      />

      {/* Featured toggle */}
      <div className="absolute left-4 top-4 z-[1000]">
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

      {/* Detail panel */}
      {selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 z-[1001] sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:p-3">
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
