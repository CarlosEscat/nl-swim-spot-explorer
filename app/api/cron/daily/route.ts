import { revalidatePath } from "next/cache";
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

/**
 * Route patterns the pages are cached under. These are INTERNAL paths: proxy.ts
 * rewrites the unprefixed Dutch URLs to /nl/..., and revalidatePath keys off the
 * route file structure rather than the URL in the address bar. One pattern call
 * covers every generated page of that route, both locales included.
 */
const SPOT_PAGES = "/[lang]/spots/[slug]";
const AGGREGATE_PAGES = [
  "/[lang]",
  "/[lang]/beste-zwemplekken",
  "/[lang]/zwemplekken/[provincie]",
  "/[lang]/zwemmen/[stad]",
];

type Job = {
  name: string;
  /** Is this job due on the given (UTC) day? */
  due: (d: Date) => boolean;
  run: () => Promise<object>;
  /** Page routes whose output this job's data can change. */
  revalidates: string[];
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
    // May add or delist spots, which changes every listing too.
    revalidates: [SPOT_PAGES, ...AGGREGATE_PAGES],
  },
  // Daily during the bathing season (May–Oct), monthly the rest of the year.
  {
    name: "quality",
    due: (d) => {
      const month = d.getUTCMonth() + 1;
      return month >= 5 && month <= 10 ? true : d.getUTCDate() === 2;
    },
    run: () => ingestQuality(console.log),
    // Snapshots every monitored spot, and the listings show quality labels.
    revalidates: [SPOT_PAGES, ...AGGREGATE_PAGES],
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
    // The EU class badge only appears on the spot page itself.
    revalidates: [SPOT_PAGES],
  },
  // Monthly. Split across two days: the OSM backfill is the longest job we
  // run, and pairing it with anything else risks the 300 s ceiling.
  {
    name: "facilities",
    due: (d) => d.getUTCDate() === 3,
    run: () => ingestFacilities(console.log),
    // Facilities are only rendered on the spot page.
    revalidates: [SPOT_PAGES],
  },
  // Monthly, the day after facilities — featured is derived from that data.
  {
    name: "featured",
    due: (d) => d.getUTCDate() === 4,
    run: () => recomputeFeatured(console.log),
    // Drives the "top rated" rows and the /beste-zwemplekken list.
    revalidates: [SPOT_PAGES, ...AGGREGATE_PAGES],
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
  const succeeded: Job[] = [];
  let failed = false;
  for (const job of due) {
    const startedAt = Date.now();
    try {
      results[job.name] = { ok: true, ...(await job.run()) };
      succeeded.push(job);
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

  // The pages export `revalidate = false`, so this is the only thing that
  // refreshes them — which is the point: no job due means no regeneration at
  // all, instead of every page rebuilding on a timer against unchanged data.
  // In a Route Handler revalidatePath only MARKS the paths; each page is
  // rebuilt on its next visit, so the ISR write cost tracks traffic rather
  // than the ~1,500 generated pages.
  const revalidated = [...new Set(succeeded.flatMap((j) => j.revalidates))];
  for (const path of revalidated) revalidatePath(path, "page");
  if (revalidated.length > 0) {
    console.log(`cron/daily: revalidated ${revalidated.join(", ")}`);
  }

  return NextResponse.json(
    { ok: !failed, ran: due.map((j) => j.name), revalidated, results },
    { status: failed ? 500 : 200 }
  );
}
