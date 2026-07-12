import proj4 from "proj4";

// ETRS89-extended / LAEA Europe — the CRS PDOK's INSPIRE GML ships in.
proj4.defs(
  "EPSG:3035",
  "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

/** Convert EPSG:3035 (x, y) to WGS84 { lat, lng }. */
export function laeaToWgs84(x: number, y: number): { lat: number; lng: number } {
  const [lng, lat] = proj4("EPSG:3035", "WGS84", [x, y]);
  return { lat, lng };
}

/** Great-circle distance in km. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
