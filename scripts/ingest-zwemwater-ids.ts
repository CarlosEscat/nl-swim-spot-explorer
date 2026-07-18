import "./lib/env";
import { ingestZwemwaterIds } from "@/lib/ingest/zwemwater-ids";

ingestZwemwaterIds(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
