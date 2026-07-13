import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { ingestEuClassification } from "@/lib/ingest/eu-classification";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Yearly (after the EEA June publication) — refresh EU bathing-water ratings. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { unmatchedEea, ...result } = await ingestEuClassification(
      console.log
    );
    // The full EEA leftover list is log-only noise; report just its size.
    return NextResponse.json({
      ok: true,
      ...result,
      unmatchedEeaCount: unmatchedEea.length,
    });
  } catch (err) {
    console.error("refresh-eu-classification failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
