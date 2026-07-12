import "./lib/env";
import { ingestLocations } from "@/lib/ingest/locations";

ingestLocations(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
