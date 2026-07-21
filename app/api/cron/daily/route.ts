import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { ingestQuality } from "@/lib/ingest/quality";
import { ingestLocations } from "@/lib/ingest/locations";
import { refreshStationsAndLinks } from "@/lib/ingest/stations";
import { ingestZwemwaterIds } from "@/lib/ingest/zwemwater-ids";
import { ingestFacilities } from "@/lib/ingest/facilities";
import { ingestEuClassification } from "@/lib/ingest/eu-classification";
import { recomputeFeatured } from "@/lib/ingest/featured";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Single daily dispatcher for every scheduled refresh.
 *
 * Vercel's Hobby plan allows two cron jobs per project, so the per-job
 * schedules that used to live in vercel.json are expressed here instead: one
 * cron hits this route every morning and it decides what is due from the date.
 * The individual /api/cron/refresh-* routes are kept for manual triggering.
 *
 * Dates are read in UTC, matching the schedule the cron itself runs on.
 */

type Job = {
  name: string;
  /** Is this job due on the given (UTC) day? */
  due: (d: Date) => boolean;
  run: () => Promise<object>;
};

const JOBS: Job[] = [
  // Weekly, first — the upsert may add spots the later jobs need to see.
  {
    name: "locations",
    due: (d) => d.getUTCDay() === 1,
    run: async () => {
      const locations = await ingestLocations(console.log);
      const stations = await refreshStationsAndLinks(console.log);
      // Re-match zwemwater.nl ids afterwards — the upsert may add new spots.
      const zwemwaterIds = await ingestZwemwaterIds(console.log);
      return { locations, stations, zwemwaterIds };
    },
  },
  // Daily during the bathing season (May–Oct), monthly the rest of the year.
  {
    name: "quality",
    due: (d) => {
      const month = d.getUTCMonth() + 1;
      return month >= 5 && month <= 10 ? true : d.getUTCDate() === 2;
    },
    run: () => ingestQuality(console.log),
  },
  // Yearly, after the EEA publishes the new classification in June.
  {
    name: "eu-classification",
    due: (d) => d.getUTCMonth() + 1 === 6 && d.getUTCDate() === 20,
    run: async () => {
      const { unmatchedEea, ...result } = await ingestEuClassification(
        console.log
      );
      // The full EEA leftover list is log-only noise; report just its size.
      return { ...result, unmatchedEeaCount: unmatchedEea.length };
    },
  },
  // Monthly. Split across two days: the OSM backfill is the longest job we
  // run, and pairing it with anything else risks the 300 s ceiling.
  {
    name: "facilities",
    due: (d) => d.getUTCDate() === 3,
    run: () => ingestFacilities(console.log),
  },
  // Monthly, the day after facilities — featured is derived from that data.
  {
    name: "featured",
    due: (d) => d.getUTCDate() === 4,
    run: () => recomputeFeatured(console.log),
  },
];

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = JOBS.filter((job) => job.due(now));
  console.log(
    `cron/daily ${now.toISOString()} — due: ${
      due.map((j) => j.name).join(", ") || "(none)"
    }`
  );

  // Run sequentially and keep going after a failure: one dead upstream should
  // not cost us the other refreshes until tomorrow.
  const results: Record<string, unknown> = {};
  let failed = false;
  for (const job of due) {
    const startedAt = Date.now();
    try {
      results[job.name] = { ok: true, ...(await job.run()) };
    } catch (err) {
      failed = true;
      console.error(`cron/daily: ${job.name} failed:`, err);
      results[job.name] = {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      };
    }
    console.log(`cron/daily: ${job.name} took ${Date.now() - startedAt} ms`);
  }

  return NextResponse.json(
    { ok: !failed, ran: due.map((j) => j.name), results },
    { status: failed ? 500 : 200 }
  );
}
