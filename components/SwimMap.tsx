"use client";

import { useEffect, useRef } from "react";
import maplibregl, {
  type ExpressionSpecification,
  type GeoJSONSource,
  type LngLatLike,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";
import type { SpotWithData } from "@/lib/types";
import { parseAdvisory, qualityStyle } from "@/lib/quality";
import { useI18n } from "./I18nProvider";

const NL_CENTER: LngLatLike = [5.3, 52.2];
// MapLibre zoom runs ~1 lower than Leaflet's for the same view (512px tiles).
const NL_ZOOM = 7;
const SPOTS_SOURCE = "swim-spots";
const FEATURED_COLOR = "#4f46e5";
const UNOFFICIAL_COLOR = "#d97706";
const ALGAE_COLOR = "#7c3aed";

// The MapTiler key must be spelled out literally so Next.js can inline it.
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

function toGeoJSON(spots: SpotWithData[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: spots.map((spot) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.lng, spot.lat] },
      properties: {
        id: spot.id,
        pinColor: qualityStyle(spot.latest_quality?.status).pin,
        featured: spot.is_featured,
        unofficial: spot.official_status === "unofficial",
        algae:
          parseAdvisory(spot.latest_quality?.raw_notes) === "blue_green_algae",
      },
    })),
  };
}

// Circle radii matching the old 13px/18px divIcon pins and their 1.35x hover scale.
const PIN_RADIUS: ExpressionSpecification = ["case", ["get", "featured"], 9, 6.5];
const PIN_RADIUS_HOVER: ExpressionSpecification = ["case", ["get", "featured"], 12, 9];
// Ring color doubles as a status flag: indigo = featured, amber = unofficial.
const PIN_STROKE_COLOR: ExpressionSpecification = [
  "case",
  ["get", "featured"],
  FEATURED_COLOR,
  ["get", "unofficial"],
  UNOFFICIAL_COLOR,
  "#ffffff",
];
const PIN_STROKE_WIDTH: ExpressionSpecification = [
  "case",
  ["any", ["get", "featured"], ["get", "unofficial"]],
  3,
  2,
];
const NO_MATCH_FILTER: ExpressionSpecification = ["==", ["get", "id"], "__none__"];

export default function SwimMap({
  spots,
  selectedId,
  onSelect,
  pitched = false,
  focus = null,
}: {
  spots: SpotWithData[];
  selectedId: string | null;
  onSelect: (spot: SpotWithData) => void;
  pitched?: boolean;
  /** City to fly to (stable object identity required); null = NL overview. */
  focus?: { lat: number; lng: number } | null;
}) {
  const { dict } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const spotsRef = useRef(spots);
  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !MAPTILER_KEY) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
      center: NL_CENTER,
      zoom: NL_ZOOM,
      maxPitch: 70,
    });
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    // MapLibre's own ResizeObserver misses the first layout in some embedded
    // browsers — sync the canvas size explicitly as a fallback.
    const syncSize = () => map.resize();
    requestAnimationFrame(syncSize);
    map.once("load", syncSize);
    window.addEventListener("resize", syncSize);

    map.on("load", () => {
      map.addSource(SPOTS_SOURCE, {
        type: "geojson",
        data: toGeoJSON(spotsRef.current),
        cluster: true,
        clusterRadius: 45,
        // Declustered from zoom 11 — the old Leaflet map's disableClusteringAtZoom: 12.
        clusterMaxZoom: 10,
      });

      map.addLayer({
        id: "spot-clusters",
        type: "circle",
        source: SPOTS_SOURCE,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#0284c7",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            14,
            10,
            18,
            50,
            24,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "spot-cluster-counts",
        type: "symbol",
        source: SPOTS_SOURCE,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });
      // Outer violet ring flagging active blue-green algae advisories; the
      // regular stroke stays reserved for featured/unofficial.
      map.addLayer({
        id: "spot-pins-algae-ring",
        type: "circle",
        source: SPOTS_SOURCE,
        filter: ["all", ["!", ["has", "point_count"]], ["get", "algae"]],
        paint: {
          "circle-radius": ["+", PIN_RADIUS, 3.5],
          "circle-opacity": 0,
          "circle-stroke-color": ALGAE_COLOR,
          "circle-stroke-width": 2.5,
        },
      });
      map.addLayer({
        id: "spot-pins",
        type: "circle",
        source: SPOTS_SOURCE,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "pinColor"],
          "circle-radius": PIN_RADIUS,
          "circle-stroke-color": PIN_STROKE_COLOR,
          "circle-stroke-width": PIN_STROKE_WIDTH,
        },
      });
      // Enlarged copy of the hovered pin (replaces the old CSS scale(1.35) hover).
      map.addLayer({
        id: "spot-pins-hover",
        type: "circle",
        source: SPOTS_SOURCE,
        filter: NO_MATCH_FILTER,
        paint: {
          "circle-color": ["get", "pinColor"],
          "circle-radius": PIN_RADIUS_HOVER,
          "circle-stroke-color": PIN_STROKE_COLOR,
          "circle-stroke-width": PIN_STROKE_WIDTH,
        },
      });

      const styleLayers = map.getStyle().layers;

      // Hide the outdoor style's hiking/cycling route overlays — the dense
      // Dutch route networks bury the swim pins in colored lines.
      for (const layer of styleLayers) {
        if ("source-layer" in layer && layer["source-layer"] === "trail") {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      }

      // 3D buildings when tilted, below the style's labels. The vector source
      // name varies per MapTiler style, so reuse the style's own building layer's.
      const buildingLayer = styleLayers.find(
        (l) => "source-layer" in l && l["source-layer"] === "building"
      );
      if (buildingLayer && "source" in buildingLayer) {
        const firstSymbolId = styleLayers.find((l) => l.type === "symbol")?.id;
        map.addLayer(
          {
            id: "3d-buildings",
            type: "fill-extrusion",
            source: buildingLayer.source,
            "source-layer": "building",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#d8d4cc",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.6,
                ["get", "render_height"],
              ],
              "fill-extrusion-base": ["get", "render_min_height"],
              "fill-extrusion-opacity": 0.75,
            },
          },
          firstSymbolId
        );
      }

      map.on("click", "spot-pins", (e) => {
        const id = e.features?.[0]?.properties?.id;
        const spot = spotsRef.current.find((s) => s.id === id);
        if (spot) onSelectRef.current(spot);
      });
      map.on("click", "spot-clusters", async (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const source = map.getSource(SPOTS_SOURCE) as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(
          feature.properties.cluster_id
        );
        map.easeTo({
          center: (feature.geometry as Point).coordinates as [number, number],
          zoom,
        });
      });

      map.on("mousemove", "spot-pins", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features?.[0]?.properties?.id;
        map.setFilter(
          "spot-pins-hover",
          id != null ? ["==", ["get", "id"], id] : NO_MATCH_FILTER
        );
      });
      map.on("mouseleave", "spot-pins", () => {
        map.getCanvas().style.cursor = "";
        map.setFilter("spot-pins-hover", NO_MATCH_FILTER);
      });
      map.on("mouseenter", "spot-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "spot-clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;
    return () => {
      window.removeEventListener("resize", syncSize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update pins when the spot list changes (e.g. featured-only toggle)
  useEffect(() => {
    const source = mapRef.current?.getSource(SPOTS_SOURCE) as
      | GeoJSONSource
      | undefined;
    source?.setData(toGeoJSON(spots));
  }, [spots]);

  // Drive the camera from selection + 3D state together — combined into one
  // effect so a selection change and a pitch change landing in the same
  // render don't fire two competing easeTo/flyTo calls that cancel each other.
  const lastSpotRef = useRef<{ lng: number; lat: number } | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedId) {
      const spot = spots.find((s) => s.id === selectedId);
      if (spot) {
        lastSpotRef.current = { lng: spot.lng, lat: spot.lat };
        // Below Tailwind's `sm` breakpoint the panel covers the bottom 2/3 of
        // the screen (Explorer: top-1/3) — shift the camera target up so the
        // pin lands mid-way in the visible top third instead of behind it.
        const container = map.getContainer();
        const offset: [number, number] =
          container.clientWidth < 640
            ? [0, -container.clientHeight / 3]
            : [0, 0];
        if (pitched) {
          map.easeTo({
            center: [spot.lng, spot.lat],
            offset,
            // 3D buildings only exist from zoom 15 up
            zoom: Math.max(map.getZoom(), 16.3),
            pitch: 60,
            duration: 1200,
          });
        } else {
          map.easeTo({
            center: [spot.lng, spot.lat],
            offset,
            zoom: Math.max(map.getZoom(), 13),
            pitch: 0,
            bearing: 0,
            duration: 800,
          });
        }
      }
    } else if (lastSpotRef.current) {
      map.easeTo({
        center: [lastSpotRef.current.lng, lastSpotRef.current.lat],
        // City-wide overview zoom, but never zoom in from a wider view.
        zoom: Math.min(map.getZoom(), 11),
        pitch: 0,
        bearing: 0,
        duration: 1000,
      });
      lastSpotRef.current = null;
    } else if (map.getPitch() > 0) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    }
  }, [selectedId, pitched, spots]);

  // City focus flight. Declared after the selection effect on purpose: when a
  // city change also clears the selection, both effects fire camera moves in
  // the same commit and the later call wins.
  const focusMountedRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!focusMountedRef.current) {
      // Skip the initial render — the map already starts at the NL overview.
      focusMountedRef.current = true;
      return;
    }
    if (!map) return;
    if (focus) {
      map.flyTo({
        center: [focus.lng, focus.lat],
        zoom: 10,
        pitch: 0,
        bearing: 0,
        duration: 1400,
      });
    } else {
      map.flyTo({
        center: NL_CENTER,
        zoom: NL_ZOOM,
        pitch: 0,
        bearing: 0,
        duration: 1400,
      });
    }
  }, [focus]);

  if (!MAPTILER_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-sky-50 px-6 text-center text-sm text-sky-800">
        {dict.map.missing_key}
      </div>
    );
  }
  return <div ref={containerRef} className="h-full w-full" />;
}
