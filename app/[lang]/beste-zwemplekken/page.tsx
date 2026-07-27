import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import SpotLinkCard from "@/components/SpotLinkCard";
import { getStore } from "@/lib/db/store";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  pathFor,
  t,
} from "@/lib/i18n";
import { breadcrumbJsonLd, itemListJsonLd, siteBase } from "@/lib/jsonld";
import { listProvinces, provinceSlug, spotsInProvince } from "@/lib/regions";

// The featured set itself is re-derived monthly (compute:featured cron), and
// /api/cron/daily revalidates this page when that job runs — so no timer.
// Caveat: the year in the title now rolls over on the first cron day of
// January (the 2nd, when the quality job is due) rather than at midnight.
export const revalidate = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const spots = await store.getSpots();
  const count = spots.filter((s) => s.is_featured).length;
  const year = new Date().getFullYear();
  const title = t(dict.best.meta_title, { year });
  const description = t(dict.best.meta_description, { count, year });
  const path = "/beste-zwemplekken";
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
      images: [pathFor(locale, "/opengraph-image")],
    },
  };
}

export default async function BestSpotsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const store = await getStore();
  const allSpots = await store.getSpotsWithData();
  const featured = allSpots.filter((s) => s.is_featured);
  const provinces = listProvinces(featured);
  const year = new Date().getFullYear();
  const h1 = t(dict.best.h1, { year });

  return (
    <div className="h-full overflow-y-auto">
      <JsonLd
        data={breadcrumbJsonLd([
          {
            name: dict.region.breadcrumb_home,
            url: `${siteBase()}${pathFor(locale, "/")}`,
          },
          { name: h1 },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          h1,
          featured.map((s) => ({
            name: s.name,
            url: `${siteBase()}${pathFor(locale, `/spots/${s.slug}`)}`,
          }))
        )}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: dict.region.breadcrumb_home, href: pathFor(locale, "/") },
            { label: h1 },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {h1}
        </h1>
        <p className="mt-2 text-gray-600">
          {t(dict.best.intro, { count: featured.length })}
        </p>

        {provinces.map((p) => (
          <section key={p} className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              <Link
                href={pathFor(locale, `/zwemplekken/${provinceSlug(p)}`)}
                className="hover:text-indigo-700"
              >
                {p}
              </Link>
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {spotsInProvince(featured, p).map((s) => (
                <SpotLinkCard key={s.id} spot={s} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.region.by_province}
          </h2>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {listProvinces(allSpots).map((p) => (
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
