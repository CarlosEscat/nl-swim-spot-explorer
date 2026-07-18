import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import EuClassBadge from "@/components/EuClassBadge";
import JsonLd from "@/components/JsonLd";
import MeasurementsChart from "@/components/MeasurementsChart";
import SpotLinkCard from "@/components/SpotLinkCard";
import I18nProvider from "@/components/I18nProvider";
import QualityTimeline from "@/components/QualityTimeline";
import SpotLiveClient from "@/components/SpotLiveClient";
import { AERIAL_ATTRIBUTION, aerialImageUrl } from "@/lib/aerial";
import { GUIDES } from "@/lib/content/guides";
import { getStore } from "@/lib/db/store";
import { generatedAccessNotes, localizedAccessNotes } from "@/lib/describe";
import {
  defaultLocale,
  formatDate,
  getDictionary,
  hasLocale,
  pathFor,
  t,
  type Dictionary,
} from "@/lib/i18n";
import {
  advisoryLabel,
  isUrgentStatus,
  parseAdvisory,
  qualityLabel,
  qualityStyle,
} from "@/lib/quality";
import { breadcrumbJsonLd, siteBase, spotJsonLd } from "@/lib/jsonld";
import { cityForSpot, cityName, nearestSpots, provinceSlug } from "@/lib/regions";

// ISR: pages regenerate hourly; quality data itself refreshes monthly via cron.
export const revalidate = 3600;
export const dynamicParams = true;

// The lang segment comes from the parent layout's generateStaticParams.
export async function generateStaticParams() {
  const store = await getStore();
  const spots = await store.getSpots();
  return spots.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spot = await store.getSpotBySlug(slug);
  if (!spot) return {};
  const title = t(dict.meta.spot_title, {
    name: spot.name,
    province: spot.province,
  });
  const place = [spot.municipality, spot.province].filter(Boolean).join(", ");
  const description = t(
    spot.official_status === "unofficial"
      ? dict.meta.spot_description_unofficial
      : dict.meta.spot_description_official,
    { name: spot.name, place }
  );
  const path = `/spots/${spot.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: pathFor(locale, path),
      languages: {
        nl: path,
        en: `/en${path}`,
        "x-default": path,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: pathFor(locale, path),
    },
  };
}

function Fact({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  /** Highlight the tile green — used for facilities that are present. */
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        positive
          ? "border-green-200 bg-green-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <dt
        className={`text-xs font-medium uppercase tracking-wide ${
          positive ? "text-green-600" : "text-gray-400"
        }`}
      >
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-sm font-semibold ${
          positive ? "text-green-800" : "text-gray-800"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function facilityText(v: boolean | null | undefined, dict: Dictionary): string {
  return v === true
    ? dict.facilities.yes
    : v === false
      ? dict.facilities.no
      : dict.facilities.unknown;
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spot = await store.getSpotBySlug(slug);
  if (!spot) notFound();

  const allSpots = await store.getSpotsWithData();
  const nearby = nearestSpots(spot, allSpots, 5);
  const city = cityForSpot(spot);

  const qualityHistory =
    spot.official_status === "official"
      ? await store.getQualityHistory(spot.id)
      : [];
  const q = spot.latest_quality;
  const style = qualityStyle(q?.status);
  const reason = parseAdvisory(q?.raw_notes);
  const d = spot.details;
  const curatedNotes = localizedAccessNotes(d, locale);
  const generatedNotes = curatedNotes ? null : generatedAccessNotes(spot, dict);

  const place = [spot.municipality, spot.province].filter(Boolean).join(", ");
  const metaDescription = t(
    spot.official_status === "unofficial"
      ? dict.meta.spot_description_unofficial
      : dict.meta.spot_description_official,
    { name: spot.name, place }
  );
  const spotUrl = `${siteBase()}${pathFor(locale, `/spots/${spot.slug}`)}`;

  return (
    <div className="h-full overflow-y-auto">
      <JsonLd data={spotJsonLd(spot, metaDescription, spotUrl, dict)} />
      <JsonLd
        data={breadcrumbJsonLd([
          {
            name: dict.region.breadcrumb_home,
            url: `${siteBase()}${pathFor(locale, "/")}`,
          },
          {
            name: spot.province,
            url: `${siteBase()}${pathFor(
              locale,
              `/zwemplekken/${provinceSlug(spot.province)}`
            )}`,
          },
          { name: spot.name },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <Breadcrumb
            items={[
              {
                label: dict.region.breadcrumb_home,
                href: pathFor(locale, "/"),
              },
              {
                label: spot.province,
                href: pathFor(
                  locale,
                  `/zwemplekken/${provinceSlug(spot.province)}`
                ),
              },
              { label: spot.name },
            ]}
          />
          <nav className="mb-4 text-sm text-gray-400">
            <Link
              href={`${pathFor(locale, "/")}?spot=${spot.slug}`}
              className="hover:text-indigo-600"
            >
              {dict.spot.back_to_map}
            </Link>
          </nav>
        </div>

        <figure className="mb-6">
          <Image
            src={aerialImageUrl(spot.lat, spot.lng, {
              width: 1200,
              height: 420,
              spanM: 500,
            })}
            alt={t(dict.panel.aerial_alt, { name: spot.name })}
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
            {spot.official_status === "unofficial"
              ? dict.spot.unofficial_intro
              : dict.spot.official_intro}
            {[spot.municipality, spot.province].filter(Boolean).join(", ")}
            {spot.is_featured && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {dict.panel.featured}
              </span>
            )}
            {spot.official_status === "unofficial" && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {dict.panel.unofficial_spot}
              </span>
            )}
          </p>
        </header>

        {spot.is_featured && (
          <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
            {spot.eu_classification === "excellent"
              ? t(dict.panel.featured_note_rated, { province: spot.province })
              : dict.panel.featured_note_picked}
          </p>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.water_quality}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold ${style.badge}`}
            >
              {isUrgentStatus(q?.status) && <span aria-hidden>⚠</span>}
              {qualityLabel(q?.status, dict)}
            </span>
            {reason === "blue_green_algae" && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-violet-700 px-3 py-1.5 text-sm font-semibold text-white">
                <span aria-hidden>⚠</span> {advisoryLabel(reason, dict)}
              </span>
            )}
            <EuClassBadge
              classification={spot.eu_classification}
              year={spot.eu_classification_year}
              dict={dict}
            />
            <span className="text-sm text-gray-500">
              {q
                ? t(dict.panel.as_of_source, {
                    date: formatDate(q.measured_at, locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                    source: q.source,
                  })
                : spot.official_status === "unofficial"
                  ? dict.panel.not_monitored
                  : dict.panel.no_reading}
            </span>
          </div>
          {reason === "blue_green_algae" && (
            <p className="mt-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
              {dict.advisory.algae_note}{" "}
              <Link
                href={pathFor(locale, "/info/blauwalg")}
                className="font-semibold underline hover:text-violet-700"
              >
                {dict.advisory.algae_more}
              </Link>
            </p>
          )}
          {reason && reason !== "blue_green_algae" && (
            <p className="mt-2 text-sm text-gray-500">
              {advisoryLabel(reason, dict)}
            </p>
          )}
          <QualityTimeline readings={qualityHistory} dict={dict} />
          {spot.zwemwater_id && (
            <MeasurementsChart slug={spot.slug} dict={dict} locale={locale} />
          )}
          {spot.official_status === "unofficial" && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {dict.spot.unofficial_disclaimer}
            </p>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.right_now}
          </h2>
          <div className="mt-2">
            <I18nProvider locale={locale} dict={dict}>
              <SpotLiveClient slug={spot.slug} />
            </I18nProvider>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.access}
          </h2>
          <p className="mt-2 text-gray-700">
            {curatedNotes ?? generatedNotes ?? (
              <span className="text-gray-400">{dict.spot.access_default}</span>
            )}
          </p>
          {generatedNotes && (
            <p className="mt-2 text-xs text-gray-400">
              {dict.describe.generated_note}
            </p>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.panel.facilities}
          </h2>
          {d ? (
            <>
              <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Fact
                  label={dict.facilities.restrooms}
                  value={facilityText(d.has_restrooms, dict)}
                  positive={d.has_restrooms === true}
                />
                <Fact
                  label={dict.facilities.catering}
                  value={facilityText(d.has_catering, dict)}
                  positive={d.has_catering === true}
                />
                <Fact
                  label={dict.facilities.parking}
                  value={facilityText(d.has_parking, dict)}
                  positive={d.has_parking === true}
                />
                <Fact
                  label={dict.facilities.lifeguard}
                  value={facilityText(d.has_lifeguard, dict)}
                  positive={d.has_lifeguard === true}
                />
                <Fact
                  label={dict.facilities.boat_ramp}
                  value={facilityText(d.has_boat_ramp, dict)}
                  positive={d.has_boat_ramp === true}
                />
                <Fact
                  label={dict.facilities.lounging_area}
                  value={facilityText(d.lounging_area, dict)}
                  positive={d.lounging_area === true}
                />
                <Fact
                  label={dict.facilities.nude_recreation}
                  value={facilityText(d.nude_recreation, dict)}
                  positive={d.nude_recreation === true}
                />
              </dl>
              {d.facilities_source === "osm" && (
                <p className="mt-2 text-xs text-gray-400">
                  {dict.spot.facilities_osm_note}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-400">
              {dict.spot.facilities_missing}
            </p>
          )}
        </section>

        {spot.webcam_url && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.panel.webcam}
            </h2>
            <iframe
              src={spot.webcam_url}
              className="mt-2 aspect-video w-full rounded-xl border border-gray-200"
              allow="autoplay"
              title={t(dict.panel.webcam_title, { name: spot.name })}
            />
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.spot.location}
          </h2>
          <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Fact
              label={dict.spot.water_type}
              value={spot.water_type ? dict.water[spot.water_type] : "—"}
            />
            <Fact label={dict.spot.province} value={spot.province} />
            <Fact
              label={dict.spot.municipality}
              value={spot.municipality ?? "—"}
            />
            <Fact
              label={dict.spot.coordinates}
              value={`${spot.lat.toFixed(4)}, ${spot.lng.toFixed(4)}`}
            />
          </dl>
          <p className="mt-3 text-sm">
            <a
              className="font-semibold text-indigo-600 hover:text-indigo-800"
              href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              {dict.spot.open_maps}
            </a>
          </p>
        </section>

        {nearby.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.region.nearby}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {nearby.map(({ spot: s, km }) => (
                <SpotLinkCard
                  key={s.id}
                  spot={s}
                  locale={locale}
                  dict={dict}
                  km={km}
                />
              ))}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link
                href={pathFor(
                  locale,
                  `/zwemplekken/${provinceSlug(spot.province)}`
                )}
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {t(dict.region.province_link, { name: spot.province })}
              </Link>
              {city && (
                <Link
                  href={pathFor(locale, `/zwemmen/${city.id}`)}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {t(dict.region.city_link, { name: cityName(city, locale) })}
                </Link>
              )}
            </p>
          </section>
        )}

        <section className="mt-8 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.guides.more_title}
          </h2>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={pathFor(locale, `/info/${g.slug}`)}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                {g.content[locale].title}
              </Link>
            ))}
            <Link
              href={pathFor(locale, "/beste-zwemplekken")}
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              {dict.best.link}
            </Link>
          </p>
        </section>

        <footer className="mt-10 border-t border-gray-100 pt-4 text-xs text-gray-400">
          {dict.spot.footer}
        </footer>
      </article>
    </div>
  );
}
