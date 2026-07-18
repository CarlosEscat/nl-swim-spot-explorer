import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import SpotLinkCard from "@/components/SpotLinkCard";
import { CITIES } from "@/lib/cities";
import { getStore } from "@/lib/db/store";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  pathFor,
  t,
} from "@/lib/i18n";
import { breadcrumbJsonLd, itemListJsonLd, siteBase } from "@/lib/jsonld";
import { qualityLabel } from "@/lib/quality";
import {
  cityName,
  listProvinces,
  provinceBySlug,
  provinceSlug,
  spotsInProvince,
  spotsNearCity,
} from "@/lib/regions";
import type { SpotWithData } from "@/lib/types";

// Same ISR cadence as the spot pages; underlying data refreshes via cron.
export const revalidate = 3600;

export async function generateStaticParams() {
  const store = await getStore();
  const spots = await store.getSpots();
  return listProvinces(spots).map((p) => ({ provincie: provinceSlug(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; provincie: string }>;
}): Promise<Metadata> {
  const { lang, provincie } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spots = await store.getSpots();
  const province = provinceBySlug(spots, provincie);
  if (!province) return {};
  const officialCount = spotsInProvince(spots, province).filter(
    (s) => s.official_status === "official"
  ).length;
  const title = t(dict.region.province_meta_title, { name: province });
  const description = t(dict.region.province_meta_description, {
    name: province,
    count: officialCount,
  });
  const path = `/zwemplekken/${provincie}`;
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
    },
  };
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ lang: string; provincie: string }>;
}) {
  const { lang, provincie } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const allSpots = await store.getSpotsWithData();
  const province = provinceBySlug(allSpots, provincie);
  if (!province) notFound();

  const spots = spotsInProvince(allSpots, province);
  const officialCount = spots.filter(
    (s) => s.official_status === "official"
  ).length;
  const excellentCount = spots.filter(
    (s) => s.eu_classification === "excellent"
  ).length;
  const topRated = spots.filter((s) => s.is_featured);

  // Group by municipality for a scannable (and crawlable) full list.
  const byMunicipality = new Map<string, SpotWithData[]>();
  for (const s of spots) {
    const key = s.municipality ?? "—";
    byMunicipality.set(key, [...(byMunicipality.get(key) ?? []), s]);
  }
  const municipalities = [...byMunicipality.keys()].sort((a, b) =>
    a.localeCompare(b, "nl")
  );

  // Cities whose 20 km radius contains at least one spot of this province.
  const relatedCities = CITIES.filter(
    (c) => spotsNearCity(c, spots).length > 0
  );
  const otherProvinces = listProvinces(allSpots).filter((p) => p !== province);

  const intro =
    t(dict.region.province_intro_base, {
      name: province,
      count: officialCount,
    }) +
    (excellentCount > 0
      ? t(dict.region.intro_excellent, { count: excellentCount })
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
          { name: province },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          t(dict.region.province_h1, { name: province }),
          spots.map((s) => ({
            name: s.name,
            url: `${siteBase()}${pathFor(locale, `/spots/${s.slug}`)}`,
          }))
        )}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: dict.region.breadcrumb_home, href: pathFor(locale, "/") },
            { label: province },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t(dict.region.province_h1, { name: province })}
        </h1>
        <p className="mt-2 text-gray-600">{intro}</p>

        {topRated.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.panel.featured}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {topRated.map((s) => (
                <SpotLinkCard key={s.id} spot={s} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {t(dict.region.all_spots_in, { name: province })} (
            {t(dict.region.spot_count, { count: spots.length })})
          </h2>
          {municipalities.map((m) => (
            <div key={m} className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700">{m}</h3>
              <ul className="mt-1.5 space-y-1">
                {byMunicipality.get(m)!.map((s) => (
                  <li key={s.id} className="text-sm">
                    <Link
                      href={pathFor(locale, `/spots/${s.slug}`)}
                      className="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {s.is_featured && <span aria-hidden>⭐ </span>}
                      {s.name}
                    </Link>{" "}
                    <span className="text-gray-400">
                      · {qualityLabel(s.latest_quality?.status, dict)}
                      {s.official_status === "unofficial" &&
                        ` · ${dict.ranked.unofficial}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {relatedCities.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.region.by_city}
            </h2>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {relatedCities.map((c) => (
                <Link
                  key={c.id}
                  href={pathFor(locale, `/zwemmen/${c.id}`)}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {t(dict.region.city_link, { name: cityName(c, locale) })}
                </Link>
              ))}
            </p>
          </section>
        )}

        <section className="mt-8 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.region.by_province}
          </h2>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {otherProvinces.map((p) => (
              <Link
                key={p}
                href={pathFor(locale, `/zwemplekken/${provinceSlug(p)}`)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                {p}
              </Link>
            ))}
          </p>
        </section>
      </div>
    </div>
  );
}
