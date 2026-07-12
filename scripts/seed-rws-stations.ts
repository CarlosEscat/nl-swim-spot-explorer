import "./lib/env";
import { refreshStationsAndLinks } from "@/lib/ingest/stations";

// Seeds live RWS stations AND links each spot to its nearest one.
refreshStationsAndLinks(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
