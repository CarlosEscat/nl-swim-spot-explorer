import "./lib/env";
import { refreshStationsAndLinks } from "@/lib/ingest/stations";

// Alias of seed-rws-stations: station refresh and nearest-link always run together,
// since the station list must be probed for liveness before linking.
refreshStationsAndLinks(console.log).catch((err) => {
  console.error(err);
  process.exit(1);
});
