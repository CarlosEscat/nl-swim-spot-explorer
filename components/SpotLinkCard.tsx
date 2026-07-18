import Image from "next/image";
import Link from "next/link";
import { aerialImageUrl } from "@/lib/aerial";
import { pathFor, t, type Dictionary, type Locale } from "@/lib/i18n";
import { qualityLabel, qualityStyle } from "@/lib/quality";
import { formatKm } from "@/lib/regions";
import type { SpotWithData } from "@/lib/types";

/**
 * Compact server-rendered link card for a swim spot — the building block of
 * the crawlable internal links on region pages, the homepage hub and the
 * "nearby" section of spot pages.
 */
export default function SpotLinkCard({
  spot,
  locale,
  dict,
  km,
}: {
  spot: SpotWithData;
  locale: Locale;
  dict: Dictionary;
  /** Distance to show (km), e.g. from a city center or another spot. */
  km?: number;
}) {
  const style = qualityStyle(spot.latest_quality?.status);
  return (
    <Link
      href={pathFor(locale, `/spots/${spot.slug}`)}
      className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
    >
      <Image
        src={aerialImageUrl(spot.lat, spot.lng, {
          width: 160,
          height: 120,
          spanM: 400,
        })}
        alt={t(dict.panel.aerial_alt, { name: spot.name })}
        width={80}
        height={60}
        className="h-[60px] w-20 shrink-0 rounded-lg border border-gray-100 object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
          {spot.is_featured && <span aria-hidden>⭐ </span>}
          {spot.name}
        </p>
        <p className="truncate text-xs text-gray-500">
          {[spot.municipality, spot.province].filter(Boolean).join(", ")}
          {km != null && (
            <> · {t(dict.region.km_away, { km: formatKm(km, locale) })}</>
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-[11px]">
          <span
            className={`rounded-full border px-1.5 py-px font-semibold ${style.badge}`}
          >
            {qualityLabel(spot.latest_quality?.status, dict)}
          </span>
          {spot.official_status === "unofficial" && (
            <span className="rounded-full bg-amber-100 px-1.5 py-px font-semibold text-amber-700">
              {dict.panel.unofficial_spot}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
