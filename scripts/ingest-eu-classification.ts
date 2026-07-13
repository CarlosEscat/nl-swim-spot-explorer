import "./lib/env";
import { ingestEuClassification } from "@/lib/ingest/eu-classification";

ingestEuClassification(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
