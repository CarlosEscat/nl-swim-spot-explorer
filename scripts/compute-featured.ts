import "./lib/env";
import { recomputeFeatured } from "@/lib/ingest/featured";

recomputeFeatured(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
