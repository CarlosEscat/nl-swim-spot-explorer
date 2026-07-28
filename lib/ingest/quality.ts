import {
  fetchAdvisories,
  mapAdvisoryStatus,
  statusSeverity,
} from "@/lib/data-sources/zwemwater";
import { getStore } from "@/lib/db/store";
import { nameKey } from "@/lib/slug";
import type { QualityStatus, WaterQualityReading } from "@/lib/types";

export interface IngestQualityResult {
  advisoryRows: number;
  activeAdvisories: number;
  allClear: number;
  inserted: number;
  unmatched: string[];
  /**
   * Slugs whose rendered status actually moved this run, i.e. the only spot
   * pages whose quality section can look different afterwards. In season this
   * is usually a handful out of ~700 — the snapshot re-records "good" for
   * everything else, which changes the row but not the verdict.
   */
  changedSlugs: string[];
}

/**
 * Monthly snapshot: for every official spot, record its current status.
 * Spots with an active advisory get that advisory's status (worst wins);
 * everything else is 'good' — zwemwater.nl only publishes measures, so
 * "no active measure" is the all-clear. Unofficial/delisted spots are not
 * monitored, so they get no reading (the UI shows "No data") rather than a
 * misleading all-clear.
 * Shared by the CLI script and the monthly cron route.
 */
export async function ingestQuality(
  log: (msg: string) => void = () => {}
): Promise<IngestQualityResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  // Spots *with* their current reading: the previous status is what tells us
  // which pages the cron actually has to revalidate afterwards.
  const spots = await store.getSpotsWithData();
  if (spots.length === 0) {
    throw new Error("No spots in store — run ingest-locations first.");
  }
  const spotByKey = new Map(spots.map((s) => [nameKey(s.name), s]));

  log("Downloading zwemwater.nl advisory XLSX…");
  const advisories = await fetchAdvisories();
  log(`Parsed ${advisories.length} advisory rows`);

  const today = new Date().toISOString().slice(0, 10);
  const active = advisories.filter(
    (a) => a.startDate <= today && (!a.endDate || a.endDate >= today)
  );

  // Worst active advisory per matched spot
  const worstBySpotId = new Map<
    string,
    { status: QualityStatus; date: string; notes: string }
  >();
  const unmatched = new Set<string>();
  for (const adv of active) {
    const spot = spotByKey.get(nameKey(adv.spotName));
    if (!spot) {
      unmatched.add(adv.spotName);
      continue;
    }
    const status = mapAdvisoryStatus(adv.status);
    const cur = worstBySpotId.get(spot.id);
    if (!cur || statusSeverity(status) > statusSeverity(cur.status)) {
      worstBySpotId.set(spot.id, {
        status,
        date: adv.startDate,
        notes: `${adv.status}${adv.reason ? `: ${adv.reason}` : ""}`,
      });
    }
  }

  const monitored = spots.filter((s) => s.official_status === "official");
  const readings = monitored.map<WaterQualityReading>((spot) => {
    const advisory = worstBySpotId.get(spot.id);
    return {
      spot_id: spot.id,
      measured_at: advisory?.date ?? today,
      status: advisory?.status ?? "good",
      source: "zwemwater.nl",
      raw_notes: advisory?.notes ?? null,
    };
  });

  // Compare against the reading each spot is currently rendered with. The
  // advisory reason counts too: the spot page prints it next to the badge, so
  // "warning: blauwalg" → "warning: e-coli" is a visible change at equal status.
  const spotById = new Map(spots.map((s) => [s.id, s]));
  const changedSlugs = readings
    .filter((r) => {
      const previous = spotById.get(r.spot_id)?.latest_quality;
      return (
        !previous ||
        previous.status !== r.status ||
        previous.raw_notes !== r.raw_notes
      );
    })
    .map((r) => spotById.get(r.spot_id)?.slug)
    .filter((slug): slug is string => Boolean(slug));

  const inserted = await store.insertQualityReadings(readings);
  log(
    `Status changed for ${changedSlugs.length} of ${readings.length} monitored spots.`
  );
  log(
    `Snapshot: ${worstBySpotId.size} spots with active advisories, ` +
      `${monitored.length - worstBySpotId.size} all-clear ` +
      `(${spots.length - monitored.length} unofficial/delisted spots skipped). ` +
      `Inserted ${inserted} new readings.`
  );
  if (unmatched.size > 0) {
    log(
      `${unmatched.size} advisory spot names not matched to a PDOK location ` +
        `(delisted or renamed): ${[...unmatched].slice(0, 10).join("; ")}…`
    );
  }
  return {
    advisoryRows: advisories.length,
    activeAdvisories: worstBySpotId.size,
    allClear: monitored.length - worstBySpotId.size,
    inserted,
    unmatched: [...unmatched],
    changedSlugs,
  };
}
