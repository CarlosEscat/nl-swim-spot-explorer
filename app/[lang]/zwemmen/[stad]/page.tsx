import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import SpotLinkCard from "@/components/SpotLinkCard";
import { CITIES, CITY_RADIUS_KM } from "@/lib/cities";
import { getStore } from "@/lib/db/store";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  pathFor,
  t,
} from "@/lib/i18n";
import { breadcrumbJsonLd, itemListJsonLd, siteBase } from "@/lib/jsonld";
import { cityName, formatKm, provinceSlug, spotsNearCity } from "@/lib/regions";

// Same ISR cadence as the spot pages; underlying data refreshes via cron.
export const revalidate = 3600;

export function generateStaticParams() {
  return CITIES.map((c) => ({ stad: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; stad: string }>;
}): Promise<Metadata> {
  const { lang, stad } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const city = CITIES.find((c) => c.id === stad);
  if (!city) return {};
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spots = await store.getSpots();
  const count = spotsNearCity(city, spots).filter(
    ({ spot }) => spot.official_status === "official"
  ).length;
  const name = cityName(city, locale);
  const title = t(dict.region.city_meta_title, {
    name,
    radius: CITY_RADIUS_KM,
  });
  const description = t(dict.region.city_meta_description, {
    name,
    count,
    radius: CITY_RADIUS_KM,
  });
  const path = `/zwemmen/${city.id}`;
  return {
    title,
    description,
    alternates: {
      canonical: pathFor(locale, path),
      languages: { nl: path, en: `/en${path}`, "x-default": path },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: pathFor(locale, path),
      // A page-level openGraph block overrides the [lang] segment's
      // file-convention image, so point back at it explicitly.
      images: [pathFor(locale, "/opengraph-image")],
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ lang: string; stad: string }>;
}) {
  const { lang, stad } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const city = CITIES.find((c) => c.id === stad);
  if (!city) notFound();
  const dict = await getDictionary(locale);
  const store = await getStore();
  const allSpots = await store.getSpotsWithData();

  const near = spotsNearCity(city, allSpots);
  const officialCount = near.filter(
    ({ spot }) => spot.official_status === "official"
  ).length;
  const topRated = near.filter(({ spot }) => spot.is_featured);
  const name = cityName(city, locale);

  // Provinces the listed spots belong to, plus the other city pages.
  const relatedProvinces = [...new Set(near.map(({ spot }) => spot.province))];
  const otherCities = CITIES.filter((c) => c.id !== city.id);

  const intro =
    t(dict.region.city_intro_base, {
      name,
      count: officialCount,
      radius: CITY_RADIUS_KM,
    }) +
    (near.length > 0
      ? t(dict.region.city_intro_nearest, {
          name: near[0].spot.name,
          km: formatKm(near[0].km, locale),
        })
      : "") +
    dict.region.intro_detail;

  return (
    <div className="h-full overflow-y-auto">
      <JsonLd
        data={breadcrumbJsonLd([
          {
            name: dict.region.breadcrumb_home,
            url: `${siteBase()}${pathFor(locale, "/")}`,
          },
          { name },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          t(dict.region.city_h1, { name }),
          near.map(({ spot }) => ({
            name: spot.name,
            url: `${siteBase()}${pathFor(locale, `/spots/${spot.slug}`)}`,
          }))
        )}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: dict.region.breadcrumb_home, href: pathFor(locale, "/") },
            { label: name },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t(dict.region.city_h1, { name })}
        </h1>
        <p className="mt-2 text-gray-600">{intro}</p>

        {topRated.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.panel.featured}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {topRated.map(({ spot, km }) => (
                <SpotLinkCard
                  key={spot.id}
                  spot={spot}
                  locale={locale}
                  dict={dict}
                  km={km}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {t(dict.region.all_spots_near, { radius: CITY_RADIUS_KM })} (
            {t(dict.region.spot_count, { count: near.length })})
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {near.map(({ spot, km }) => (
              <SpotLinkCard
                key={spot.id}
                spot={spot}
                locale={locale}
                dict={dict}
                km={km}
              />
            ))}
          </div>
        </section>

        {relatedProvinces.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.region.by_province}
            </h2>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {relatedProvinces.map((p) => (
                <Link
                  key={p}
                  href={pathFor(locale, `/zwemplekken/${provinceSlug(p)}`)}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {t(dict.region.province_link, { name: p })}
                </Link>
              ))}
            </p>
          </section>
        )}

        <section className="mt-8 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.region.by_city}
          </h2>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {otherCities.map((c) => (
              <Link
                key={c.id}
                href={pathFor(locale, `/zwemmen/${c.id}`)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                {cityName(c, locale)}
              </Link>
            ))}
          </p>
        </section>
      </div>
    </div>
  );
}
