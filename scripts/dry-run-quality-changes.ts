import "./lib/env";
import {
  fetchAdvisories,
  mapAdvisoryStatus,
  statusSeverity,
} from "@/lib/data-sources/zwemwater";
import { getStore } from "@/lib/db/store";
import { nameKey } from "@/lib/slug";
import type { QualityStatus } from "@/lib/types";

/**
 * Read-only rehearsal of the change detection in lib/ingest/quality.ts: builds
 * today's readings exactly as the ingest would and reports how many spot pages
 * the cron would revalidate — WITHOUT inserting anything.
 */
async function main() {
  const store = await getStore();
  console.log(`Store: ${store.name}`);

  const spots = await store.getSpotsWithData();
  const spotByKey = new Map(spots.map((s) => [nameKey(s.name), s]));
  const spotById = new Map(spots.map((s) => [s.id, s]));

  const advisories = await fetchAdvisories();
  const today = new Date().toISOString().slice(0, 10);
  const active = advisories.filter(
    (a) => a.startDate <= today && (!a.endDate || a.endDate >= today)
  );

  const worstBySpotId = new Map<
    string,
    { status: QualityStatus; date: string; notes: string }
  >();
  for (const adv of active) {
    const spot = spotByKey.get(nameKey(adv.spotName));
    if (!spot) continue;
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
  const readings = monitored.map((spot) => {
    const advisory = worstBySpotId.get(spot.id);
    return {
      spot_id: spot.id,
      measured_at: advisory?.date ?? today,
      status: advisory?.status ?? ("good" as QualityStatus),
      raw_notes: advisory?.notes ?? null,
    };
  });

  const changed = readings.filter((r) => {
    const previous = spotById.get(r.spot_id)?.latest_quality;
    return (
      !previous ||
      previous.status !== r.status ||
      previous.raw_notes !== r.raw_notes
    );
  });

  const noPrevious = changed.filter(
    (r) => !spotById.get(r.spot_id)?.latest_quality
  );

  console.log(`\nTotal spots:            ${spots.length}`);
  console.log(`Monitored (official):   ${monitored.length}`);
  console.log(`Active advisories:      ${worstBySpotId.size}`);
  console.log(`\nWould revalidate:       ${changed.length} spot(s)`);
  console.log(`  of which no prior reading: ${noPrevious.length}`);
  console.log(
    `\nPages marked on a normal day: ${
      changed.length === 0
        ? "none (cron revalidates nothing)"
        : `${changed.length * 2} spot paths + the aggregate listings`
    }`
  );
  console.log(`Pages marked on a Monday sweep: ~1,570 (all)`);

  for (const r of changed.slice(0, 15)) {
    const s = spotById.get(r.spot_id);
    console.log(
      `  ${s?.slug}: ${s?.latest_quality?.status ?? "(none)"} → ${r.status}` +
        (r.raw_notes ? ` [${r.raw_notes}]` : "")
    );
  }
  if (changed.length > 15) console.log(`  … and ${changed.length - 15} more`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
