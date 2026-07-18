import { NextResponse } from "next/server";
import {
  fetchMeasurements,
  type ZwemwaterMeasurements,
} from "@/lib/data-sources/zwemwater";
import { getStore } from "@/lib/db/store";

export interface MeasurementsResponse extends ZwemwaterMeasurements {
  zwemwater_url: string | null;
}

// Lab samples land every 2-4 weeks, so half a day of cache is generous and
// keeps our traffic to zwemwater.nl's endpoint negligible.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
};

/**
 * Current-season bacteriological measurements (E. coli + intestinal
 * enterococci) for one spot, proxied on demand from zwemwater.nl's detail
 * overlay. Spots without a matched zwemwater_id return an empty payload —
 * the UI treats the chart as progressive enhancement.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = await getStore();

  // Accept a slug or a raw id — slugs are what the UI links with.
  const spot =
    (await store.getSpotBySlug(id)) ??
    (await store.getSpotsWithData()).find((s) => s.id === id) ??
    null;
  if (!spot) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  const empty: MeasurementsResponse = {
    e_coli: [],
    enterococci: [],
    zwemwater_url: null,
  };
  if (!spot.zwemwater_id) {
    return NextResponse.json(empty, { headers: CACHE_HEADERS });
  }

  try {
    const measurements = await fetchMeasurements(spot.zwemwater_id);
    const payload: MeasurementsResponse = {
      ...(measurements ?? { e_coli: [], enterococci: [] }),
      zwemwater_url: `https://www.zwemwater.nl/?id=${spot.zwemwater_id}`,
    };
    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error(`measurements fetch failed for ${spot.slug}:`, err);
    return NextResponse.json(empty, { headers: CACHE_HEADERS });
  }
}
