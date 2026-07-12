import "./lib/env";
import { seedUnofficialSpots } from "@/lib/ingest/unofficial-spots";

seedUnofficialSpots(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
