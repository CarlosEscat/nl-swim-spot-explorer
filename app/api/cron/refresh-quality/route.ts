import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { ingestQuality } from "@/lib/ingest/quality";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Daily May–Oct (bathing season), monthly the rest of the year — re-ingest the zwemwater.nl advisory snapshot. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await ingestQuality(console.log);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("refresh-quality failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
