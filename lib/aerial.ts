const WMS_BASE = "https://service.pdok.nl/hwh/luchtfotorgb/wms/v1_0";

/** Most recent nationwide 25 cm orthophoto mosaic. */
const LAYER = "Actueel_ortho25";

const EARTH_HALF_CIRCUMFERENCE = 20037508.34;

/** WGS84 → Web Mercator (EPSG:3857). Fine for NL latitudes. */
function toWebMercator(lat: number, lng: number): { x: number; y: number } {
  const x = (lng * EARTH_HALF_CIRCUMFERENCE) / 180;
  const y =
    (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / Math.PI) *
    EARTH_HALF_CIRCUMFERENCE;
  return { x, y };
}

export interface AerialImageOptions {
  /** Output image width in px. */
  width: number;
  /** Output image height in px. */
  height: number;
  /** Ground width covered by the image, in meters. Height follows the aspect ratio. */
  spanM: number;
}

/**
 * Deterministic PDOK Luchtfoto (CC-BY, Beeldmateriaal Nederland) WMS GetMap URL
 * showing an aerial photo centered on the given coordinates.
 */
export function aerialImageUrl(
  lat: number,
  lng: number,
  { width, height, spanM }: AerialImageOptions
): string {
  const { x, y } = toWebMercator(lat, lng);
  // Web Mercator meters are stretched by 1/cos(lat) vs ground meters.
  const scale = 1 / Math.cos((lat * Math.PI) / 180);
  const halfW = (spanM * scale) / 2;
  const halfH = halfW * (height / width);
  const bbox = [x - halfW, y - halfH, x + halfW, y + halfH].join(",");

  const params = new URLSearchParams({
    service: "WMS",
    version: "1.3.0",
    request: "GetMap",
    layers: LAYER,
    styles: "",
    crs: "EPSG:3857",
    bbox,
    width: String(width),
    height: String(height),
    format: "image/jpeg",
  });
  return `${WMS_BASE}?${params.toString()}`;
}

export const AERIAL_ATTRIBUTION = "Aerial photo: Beeldmateriaal Nederland / PDOK (CC-BY 4.0)";
