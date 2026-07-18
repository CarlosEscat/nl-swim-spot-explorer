import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { GUIDES, getGuide } from "@/lib/content/guides";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  pathFor,
} from "@/lib/i18n";
import { breadcrumbJsonLd, faqJsonLd, siteBase } from "@/lib/jsonld";

// Static content; hourly ISR keeps it in line with the rest of the site.
export const revalidate = 3600;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ gids: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; gids: string }>;
}): Promise<Metadata> {
  const { lang, gids } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const guide = getGuide(gids);
  if (!guide) return {};
  const content = guide.content[locale];
  const path = `/info/${guide.slug}`;
  return {
    title: content.title,
    description: content.metaDescription,
    alternates: {
      canonical: pathFor(locale, path),
      languages: { nl: path, en: `/en${path}`, "x-default": path },
    },
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      type: "article",
      url: pathFor(locale, path),
      images: [pathFor(locale, "/opengraph-image")],
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string; gids: string }>;
}) {
  const { lang, gids } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const guide = getGuide(gids);
  if (!guide) notFound();
  const content = guide.content[locale];
  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <div className="h-full overflow-y-auto">
      <JsonLd data={faqJsonLd(content.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          {
            name: dict.region.breadcrumb_home,
            url: `${siteBase()}${pathFor(locale, "/")}`,
          },
          { name: content.title },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: dict.region.breadcrumb_home, href: pathFor(locale, "/") },
            { label: content.title },
          ]}
        />

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {content.title}
        </h1>
        <p className="mt-3 text-lg text-gray-600">{content.intro}</p>

        {content.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">
              {section.heading}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-gray-700">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {dict.guides.faq_title}
          </h2>
          <dl className="mt-3 space-y-4">
            {content.faqs.map((f) => (
              <div
                key={f.question}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <dt className="font-semibold text-gray-900">{f.question}</dt>
                <dd className="mt-1.5 text-gray-700">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {dict.guides.more_title}
          </h2>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {otherGuides.map((g) => (
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
      </article>
    </div>
  );
}
