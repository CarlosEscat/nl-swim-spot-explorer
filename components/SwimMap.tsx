"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { SpotWithData } from "@/lib/types";
import { qualityStyle } from "@/lib/quality";

const NL_CENTER: L.LatLngTuple = [52.2, 5.3];
const NL_ZOOM = 8;

function pinIcon(spot: SpotWithData): L.DivIcon {
  const color = qualityStyle(spot.latest_quality?.status).pin;
  const featured = spot.is_featured;
  const size = featured ? 18 : 13;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="swim-pin${featured ? " swim-pin-featured" : ""}" style="background:${color}"></div>`,
  });
}

export default function SwimMap({
  spots,
  selectedId,
  onSelect,
}: {
  spots: SpotWithData[];
  selectedId: string | null;
  onSelect: (spot: SpotWithData) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: NL_CENTER,
      zoom: NL_ZOOM,
      zoomControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  // (Re)build markers when the spot list changes (e.g. featured-only toggle)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clusterRef.current?.remove();

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 12,
    });
    for (const spot of spots) {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: pinIcon(spot),
        title: spot.name,
      });
      marker.on("click", () => {
        onSelectRef.current(spot);
      });
      cluster.addLayer(marker);
    }
    map.addLayer(cluster);
    clusterRef.current = cluster;
  }, [spots]);

  // Fly to the selected spot
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const spot = spots.find((s) => s.id === selectedId);
    if (spot) {
      map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 14), {
        duration: 0.8,
      });
    }
  }, [selectedId, spots]);

  return <div ref={containerRef} className="h-full w-full" />;
}
