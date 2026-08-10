"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripLocale, type Locale } from "@/lib/i18n";

/**
 * NL | EN toggle. Dutch is served on unprefixed URLs and English under /en
 * (see proxy.ts), so switching just adds/strips the prefix on the current path.
 */
export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  const basePath = stripLocale(pathname);

  const linkCls = (active: boolean) =>
    active
      ? "rounded px-1.5 py-0.5 bg-sky-100 font-bold text-sky-800"
      : "rounded px-1.5 py-0.5 text-gray-400 hover:text-sky-700";

  return (
    <nav aria-label="Language" className="flex items-center gap-0.5 text-xs">
      <Link href={basePath} className={linkCls(locale === "nl")} hrefLang="nl">
        NL
      </Link>
      <Link
        href={basePath === "/" ? "/en" : `/en${basePath}`}
        className={linkCls(locale === "en")}
        hrefLang="en"
      >
        EN
      </Link>
    </nav>
  );
}
