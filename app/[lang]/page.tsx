import Explorer from "@/components/Explorer";
import I18nProvider from "@/components/I18nProvider";
import { getStore } from "@/lib/db/store";
import { defaultLocale, getDictionary, hasLocale } from "@/lib/i18n";

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

  return (
    <div className="h-full w-full">
      <I18nProvider locale={locale} dict={dict}>
        <Explorer spots={spots} />
      </I18nProvider>
    </div>
  );
}
