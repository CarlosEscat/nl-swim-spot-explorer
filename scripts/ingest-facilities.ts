import "./lib/env";
import { ingestFacilities } from "@/lib/ingest/facilities";

ingestFacilities(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
