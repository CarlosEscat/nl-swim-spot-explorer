"use client";

import { useEffect, useState } from "react";
import type { QualityHistoryResponse } from "@/app/api/spot/[id]/quality-history/route";
import { useI18n } from "./I18nProvider";
import QualityTimeline from "./QualityTimeline";

/**
 * Lazy loader for the season quality timeline in the map panel. Progressive
 * enhancement: renders nothing while loading, on error, or with <2 readings.
 */
export default function QualityHistoryClient({ slug }: { slug: string }) {
  const { dict } = useI18n();
  const [history, setHistory] = useState<QualityHistoryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/spot/${slug}/quality-history`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: QualityHistoryResponse) => {
        if (!cancelled) setHistory(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!history) return null;
  return <QualityTimeline readings={history.readings} dict={dict} />;
}
