import { aerialImageUrl } from "@/lib/aerial";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { SpotWithData } from "@/lib/types";

/**
 * schema.org JSON-LD builders for the crawlable pages. Rendered via
 * <JsonLd /> (components/JsonLd.tsx). URLs must be absolute, so everything
 * goes through siteBase() — same env fallback as sitemap.ts/robots.ts.
 */

export function siteBase(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

const INLANG: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };

export function webSiteJsonLd(dict: Dictionary, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: dict.site.name,
    description: dict.meta.description,
    url: siteBase(),
    inLanguage: INLANG[locale],
  };
}

/**
 * A swim spot as a schema.org Place (Beach for sea spots) with coordinates,
 * address, aerial image and the facilities we know are present.
 */
export function spotJsonLd(
  spot: SpotWithData,
  description: string,
  absoluteUrl: string,
  dict: Dictionary
) {
  const d = spot.details;
  const amenities = (
    [
      [dict.facilities.restrooms, d?.has_restrooms],
      [dict.facilities.catering, d?.has_catering],
      [dict.facilities.parking, d?.has_parking],
      [dict.facilities.lifeguard, d?.has_lifeguard],
      [dict.facilities.boat_ramp, d?.has_boat_ramp],
      [dict.facilities.lounging_area, d?.lounging_area],
    ] as const
  )
    .filter(([, present]) => present === true)
    .map(([name]) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    }));

  return {
    "@context": "https://schema.org",
    "@type": spot.water_type === "sea" ? "Beach" : "Place",
    name: spot.name,
    description,
    url: absoluteUrl,
    image: aerialImageUrl(spot.lat, spot.lng, {
      width: 1200,
      height: 630,
      spanM: 700,
    }),
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.lat,
      longitude: spot.lng,
    },
    address: {
      "@type": "PostalAddress",
      ...(spot.municipality && { addressLocality: spot.municipality }),
      addressRegion: spot.province,
      addressCountry: "NL",
    },
    isAccessibleForFree: true,
    publicAccess: true,
    ...(amenities.length > 0 && { amenityFeature: amenities }),
  };
}

/** Breadcrumb trail; the last item is the current page (no URL needed). */
export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

/** FAQ rich-result markup for the /info guide pages. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Ordered list of spot pages, for the province/city landing pages. */
export function itemListJsonLd(
  name: string,
  entries: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: e.url,
    })),
  };
}
