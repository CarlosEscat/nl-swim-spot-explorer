import { laeaToWgs84 } from "@/lib/geo";

const ATOM_DOWNLOAD_URL =
  "https://service.pdok.nl/provincies/zwemwater-provinciaal-rijkswateren/atom/v1_0/downloads/inspire-pv-am.nlam-lzr.gml";

const LOCATIESERVER_REVERSE =
  "https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse";

export interface PdokSwimLocation {
  localId: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Download and parse the PDOK "Zwemwaterlocaties (INSPIRE geharmoniseerd)" GML.
 * Features are bathing-water polygons in EPSG:3035; we reduce each to a centroid pin.
 */
export async function fetchSwimLocations(): Promise<PdokSwimLocation[]> {
  const res = await fetch(ATOM_DOWNLOAD_URL);
  if (!res.ok) throw new Error(`PDOK download failed: ${res.status}`);
  const gml = await res.text();

  const locations: PdokSwimLocation[] = [];
  const featureRe =
    /<gml:featureMember>([\s\S]*?)<\/gml:featureMember>/g;
  for (const [, feature] of gml.matchAll(featureRe)) {
    const localId = feature.match(/<base:localId>([^<]*)<\/base:localId>/)?.[1];
    const name = feature.match(/<gn:text>([^<]*)<\/gn:text>/)?.[1]?.trim();
    if (!localId || !name) continue;

    // Average all polygon vertices — adequate centroid for a map pin.
    // INSPIRE GML lists EPSG:3035 coordinates in official axis order: (northing, easting).
    let sx = 0,
      sy = 0,
      n = 0;
    for (const [, posList] of feature.matchAll(
      /<gml:posList>([^<]*)<\/gml:posList>/g
    )) {
      const nums = posList.trim().split(/\s+/).map(Number);
      for (let i = 0; i + 1 < nums.length; i += 2) {
        sy += nums[i];
        sx += nums[i + 1];
        n++;
      }
    }
    if (n === 0) continue;
    const { lat, lng } = laeaToWgs84(sx / n, sy / n);
    locations.push({ localId, name: name.replace(/\s+/g, " "), lat, lng });
  }
  return locations;
}

export interface ReverseGeocodeResult {
  municipality: string | null;
  province: string | null;
}

/** PDOK Locatieserver reverse geocode: WGS84 point → gemeente + provincie. */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  const url = `${LOCATIESERVER_REVERSE}?lat=${lat}&lon=${lng}&type=gemeente&rows=1&fl=gemeentenaam,provincienaam`;
  const res = await fetch(url);
  if (!res.ok) return { municipality: null, province: null };
  const json = (await res.json()) as {
    response?: { docs?: { gemeentenaam?: string; provincienaam?: string }[] };
  };
  const doc = json.response?.docs?.[0];
  return {
    municipality: doc?.gemeentenaam ?? null,
    province: doc?.provincienaam ?? null,
  };
}
