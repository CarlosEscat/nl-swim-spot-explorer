import {
  AERIAL_VARIANTS,
  aerialImageUrl,
  isAerialVariant,
} from "@/lib/aerial";
import { getStore } from "@/lib/db/store";

/**
 * A spot's aerial photo, proxied from the PDOK Luchtfoto WMS.
 *
 * PDOK renders the image at exactly the pixel size we ask for, so there is
 * nothing left for Vercel's image optimizer to do — routing <Image> through it
 * only burned a billed transformation per spot per size. This handler serves
 * the upstream JPEG as-is behind a long CDN cache instead, which also gives the
 * bytes the `Cache-Control` header PDOK omits.
 *
 * The variant presets keep the endpoint from being a general-purpose open proxy:
 * only known spot slugs and a fixed set of crops resolve.
 */

/** Aerial mosaics change once a year at most; a month at the edge is safe. */
const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; variant: string }> }
) {
  const { slug, variant } = await params;

  if (!isAerialVariant(variant)) {
    return new Response("Unknown aerial variant", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  const store = await getStore();
  const spot = await store.getSpotBySlug(slug);
  if (!spot) {
    return new Response("Spot not found", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  const upstream = await fetch(
    aerialImageUrl(spot.lat, spot.lng, AERIAL_VARIANTS[variant]),
    { cache: "no-store" }
  );

  // A WMS reports failures as a 200 with an XML ServiceException body, so trust
  // the content type rather than the status alone.
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    return new Response("Aerial photo unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
