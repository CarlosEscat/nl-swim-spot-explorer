import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SpotLiveClient from "@/components/SpotLiveClient";
import { AERIAL_ATTRIBUTION, aerialImageUrl } from "@/lib/aerial";
import { getStore } from "@/lib/db/store";
import { qualityStyle } from "@/lib/quality";

// ISR: pages regenerate hourly; quality data itself refreshes monthly via cron.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const store = await getStore();
  const spots = await store.getSpots();
  return spots.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const spot = await store.getSpotBySlug(slug);
  if (!spot) return {};
  const title = `Swimming at ${spot.name} (${spot.province})`;
  const description =
    `${spot.name} is an official outdoor swimming location in ` +
    `${[spot.municipality, spot.province].filter(Boolean).join(", ")}. ` +
    `Check live water temperature, weather, official water quality status and facilities.`;
  return {
    title,
    description,
    alternates: { canonical: `/spots/${spot.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/spots/${spot.slug}`,
    },
  };
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-gray-800">{value}</dd>
    </div>
  );
}

function facilityText(v: boolean | null | undefined): string {
  return v === true ? "Yes" : v === false ? "No" : "Unknown";
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const spot = await store.getSpotBySlug(slug);
  if (!spot) notFound();

  const q = spot.latest_quality;
  const style = qualityStyle(q?.status);
  const d = spot.details;

  return (
    <div className="h-full overflow-y-auto">
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-indigo-600">
            ← Back to the map
          </Link>
        </nav>

        <figure className="mb-6">
          <Image
            src={aerialImageUrl(spot.lat, spot.lng, {
              width: 1200,
              height: 420,
              spanM: 500,
            })}
            alt={`Aerial photo of ${spot.name}`}
            width={1200}
            height={420}
            priority
            className="w-full rounded-2xl border border-gray-200 object-cover"
          />
          <figcaption className="mt-1.5 text-right text-xs text-gray-400">
            {AERIAL_ATTRIBUTION}
          </figcaption>
        </figure>

        <header>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {spot.name}
          </h1>
          <p className="mt-1 text-gray-500">
            Official outdoor swimming location in{" "}
            {[spot.municipality, spot.province].filter(Boolean).join(", ")}
            {spot.is_featured && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                Featured
              </span>
            )}
          </p>
        </header>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Water quality
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold ${style.badge}`}
            >
              {style.label}
            </span>
            <span className="text-sm text-gray-500">
              {q
                ? `as of ${new Date(q.measured_at).toLocaleDateString("en-NL", { day: "numeric", month: "long", year: "numeric" })} · source: ${q.source}`
                : "no reading yet"}
            </span>
          </div>
          {q?.raw_notes && (
            <p className="mt-2 text-sm text-gray-500">{q.raw_notes}</p>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Right now
          </h2>
          <div className="mt-2">
            <SpotLiveClient slug={spot.slug} />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Access &amp; hours
          </h2>
          <p className="mt-2 text-gray-700">
            {d?.access_notes ?? (
              <span className="text-gray-400">
                Not curated yet — most official Dutch swim spots are open-access
                natural water without gates or fixed hours.
              </span>
            )}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Facilities
          </h2>
          {d ? (
            <>
              <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Fact label="Restrooms" value={facilityText(d.has_restrooms)} />
                <Fact label="Food & drinks" value={facilityText(d.has_catering)} />
                <Fact label="Parking" value={facilityText(d.has_parking)} />
                <Fact label="Lifeguard" value={facilityText(d.has_lifeguard)} />
                <Fact label="Boat ramp" value={facilityText(d.has_boat_ramp)} />
                <Fact label="Lounging area" value={facilityText(d.lounging_area)} />
                <Fact
                  label="Nude recreation"
                  value={facilityText(d.nude_recreation)}
                />
              </dl>
              {d.facilities_source === "osm" && (
                <p className="mt-2 text-xs text-gray-400">
                  Facilities auto-detected from OpenStreetMap data within ~300 m
                  of the spot.
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-400">
              Facilities for this spot haven&apos;t been curated yet.
            </p>
          )}
        </section>

        {spot.webcam_url && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Live camera
            </h2>
            <iframe
              src={spot.webcam_url}
              className="mt-2 aspect-video w-full rounded-xl border border-gray-200"
              allow="autoplay"
              title={`Live camera at ${spot.name}`}
            />
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Location
          </h2>
          <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Fact label="Province" value={spot.province} />
            <Fact label="Municipality" value={spot.municipality ?? "—"} />
            <Fact
              label="Coordinates"
              value={`${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}`}
            />
          </dl>
          <p className="mt-3 text-sm">
            <a
              className="font-semibold text-indigo-600 hover:text-indigo-800"
              href={`https://www.openstreetmap.org/?mlat=${spot.lat}&mlon=${spot.lng}#map=16/${spot.lat}/${spot.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in OpenStreetMap →
            </a>
          </p>
        </section>

        <footer className="mt-10 border-t border-gray-100 pt-4 text-xs text-gray-400">
          Water quality: zwemwater.nl (monthly official measures) · Water
          temperature: Rijkswaterstaat, nearest measuring station · Weather:
          Open-Meteo. Always check on-site signage before swimming.
        </footer>
      </article>
    </div>
  );
}
