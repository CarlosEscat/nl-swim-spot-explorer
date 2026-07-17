import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { recomputeFeatured } from "@/lib/ingest/featured";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Monthly, after the facilities refresh — re-derive the featured set from data. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await recomputeFeatured(console.log);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("refresh-featured failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
