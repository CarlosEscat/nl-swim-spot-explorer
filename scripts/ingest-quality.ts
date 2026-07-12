import "./lib/env";
import { ingestQuality } from "@/lib/ingest/quality";

ingestQuality(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
