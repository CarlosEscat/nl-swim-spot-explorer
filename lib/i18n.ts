import type en from "@/dictionaries/en.json";

// Deliberately NOT `server-only`: the Explorer tree is one big client
// boundary and the dictionary (<10 KB) crosses it via I18nProvider.

export type Locale = "nl" | "en";
export const locales: Locale[] = ["nl", "en"];
/** Dutch is served on unprefixed URLs; English lives under /en (see proxy.ts). */
export const defaultLocale: Locale = "nl";

export type Dictionary = typeof en;

export function hasLocale(l: string): l is Locale {
  return (locales as string[]).includes(l);
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  nl: () => import("@/dictionaries/nl.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

/** Fill "{name} ({km})"-style templates from the dictionaries. */
export function t(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

/** Route path for a locale: "" prefix for nl (default), "/en" for en. */
export function pathFor(locale: Locale, path: string): string {
  if (locale === "nl") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/**
 * Inverse of `pathFor`: the unprefixed path for any locale variant.
 *
 * Strips a leading "/nl" as well as "/en" because usePathname() reports the
 * REWRITTEN path on the Dutch pages — the browser shows /spots/x while the
 * proxy resolved it to /nl/spots/x — so a caller that only strips "/en" would
 * build /en/nl/spots/x and 404.
 */
export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(nl|en)(?=\/|$)/, "") || "/";
}

const INTL_LOCALE: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };

export function formatDate(
  iso: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  return new Date(iso).toLocaleDateString(INTL_LOCALE[locale], opts);
}

export function formatDateTime(
  iso: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions
): string {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale], opts);
}

/** WMO weather code → localized short description ("—" when unknown). */
export function weatherLabel(code: number, dict: Dictionary): string {
  return (dict.weather as Record<string, string>)[String(code)] ?? "—";
}
