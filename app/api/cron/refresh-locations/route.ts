import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { ingestLocations } from "@/lib/ingest/locations";
import { refreshStationsAndLinks } from "@/lib/ingest/stations";
import { ingestZwemwaterIds } from "@/lib/ingest/zwemwater-ids";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Weekly — re-pull PDOK in case locations are added or delisted, then refresh
 * live stations and nearest-station links (the upsert resets them, and new
 * spots need linking).
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const locations = await ingestLocations(console.log);
    const stations = await refreshStationsAndLinks(console.log);
    // Re-match zwemwater.nl ids afterwards — the upsert may add new spots.
    const zwemwaterIds = await ingestZwemwaterIds(console.log);
    return NextResponse.json({ ok: true, locations, stations, zwemwaterIds });
  } catch (err) {
    console.error("refresh-locations failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
