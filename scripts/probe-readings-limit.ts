import "./lib/env";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const { count } = await db
    .from("water_quality_readings")
    .select("*", { count: "exact", head: true });
  console.log(`Total readings in table: ${count}`);

  // Exactly the query getSpotsWithData() runs.
  const { data } = await db
    .from("water_quality_readings")
    .select("*")
    .order("measured_at", { ascending: false });
  console.log(`Rows actually returned:  ${data?.length}`);
  console.log(
    `Oldest measured_at in that window: ${data?.[data.length - 1]?.measured_at}`
  );
  console.log(`Newest measured_at in that window: ${data?.[0]?.measured_at}`);

  const distinctSpots = new Set(data?.map((r) => r.spot_id));
  console.log(`Distinct spots covered by the window: ${distinctSpots.size}`);

  // How many spots have a non-'good' latest reading that the window misses?
  const { data: advisories } = await db
    .from("water_quality_readings")
    .select("spot_id, status, measured_at")
    .neq("status", "good")
    .order("measured_at", { ascending: false })
    .limit(2000);
  const missed = (advisories ?? []).filter((a) => !distinctSpots.has(a.spot_id));
  console.log(
    `\nNon-'good' readings whose spot is outside the window: ${
      new Set(missed.map((m) => m.spot_id)).size
    } spot(s)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
