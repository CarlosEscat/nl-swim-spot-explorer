import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  defaultLocale,
  getDictionary,
  hasLocale,
  locales,
  pathFor,
} from "@/lib/i18n";
import { logoDataUrl } from "@/lib/logo";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: {
      default: dict.meta.title_default,
      template: dict.meta.title_template,
    },
    description: dict.meta.description,
    alternates: {
      canonical: pathFor(locale, "/"),
      languages: { nl: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: dict.meta.title_default,
      description: dict.meta.description,
      siteName: dict.site.name,
      type: "website",
      locale: locale === "nl" ? "nl_NL" : "en_GB",
      url: pathFor(locale, "/"),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col font-sans">
        <header className="z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 sm:px-6">
          <Link href={pathFor(lang, "/")} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUrl} alt="" width={24} height={24} />
            <span className="text-base font-bold tracking-tight text-gray-900">
              {dict.site.name}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-400 sm:block">
              {dict.site.tagline}
            </span>
            <LanguageSwitcher locale={lang} />
          </div>
        </header>
        <main className="min-h-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
