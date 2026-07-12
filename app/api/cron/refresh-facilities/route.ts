import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { ingestFacilities } from "@/lib/ingest/facilities";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Monthly — refresh OSM-detected facilities for all spots. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await ingestFacilities(console.log);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("refresh-facilities failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
