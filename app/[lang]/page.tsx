import Link from "next/link";
import Explorer from "@/components/Explorer";
import I18nProvider from "@/components/I18nProvider";
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
import { webSiteJsonLd } from "@/lib/jsonld";
import {
  cityName,
  listProvinces,
  provinceSlug,
  spotsInProvince,
} from "@/lib/regions";

// Spot/quality data refreshes via cron at most monthly — hourly ISR is generous.
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spots = await store.getSpotsWithData();

  const officialCount = spots.filter(
    (s) => s.official_status === "official"
  ).length;
  const provinces = listProvinces(spots);
  const topRated = spots.filter((s) => s.is_featured).slice(0, 8);

  return (
    <div className="h-full overflow-y-auto">
      <JsonLd data={webSiteJsonLd(dict, locale)} />
      {/* The map keeps the full first viewport; the crawlable link hub lives
          below the fold so the app feel is unchanged. */}
      <div className="h-full w-full">
        <I18nProvider locale={locale} dict={dict}>
          <Explorer spots={spots} />
        </I18nProvider>
      </div>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {dict.home.h1}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(dict.home.intro, { count: officialCount })}
          </p>

          {topRated.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                {dict.panel.featured}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {dict.home.top_rated_hint}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {topRated.map((s) => (
                  <SpotLinkCard
                    key={s.id}
                    spot={s}
                    locale={locale}
                    dict={dict}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.region.by_province}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {provinces.map((p) => (
                <li key={p}>
                  <Link
                    href={pathFor(locale, `/zwemplekken/${provinceSlug(p)}`)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {p}
                  </Link>{" "}
                  <span className="text-xs text-gray-400">
                    ({spotsInProvince(spots, p).length})
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {dict.region.by_city}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {CITIES.map((c) => (
                <li key={c.id}>
                  <Link
                    href={pathFor(locale, `/zwemmen/${c.id}`)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {t(dict.region.city_h1, { name: cityName(c, locale) })}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
