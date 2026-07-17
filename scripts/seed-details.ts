import "./lib/env";
import { seedCuratedDetails } from "@/lib/ingest/curated-details";
import { ALKMAAR_SEEDS } from "@/lib/ingest/curated/alkmaar";
import { AMSTERDAM_SEEDS } from "@/lib/ingest/curated/amsterdam";
import { DEN_HAAG_SEEDS } from "@/lib/ingest/curated/den-haag";
import { EINDHOVEN_SEEDS } from "@/lib/ingest/curated/eindhoven";
import { GRONINGEN_SEEDS } from "@/lib/ingest/curated/groningen";
import { HAARLEM_SEEDS } from "@/lib/ingest/curated/haarlem";
import { ROTTERDAM_SEEDS } from "@/lib/ingest/curated/rotterdam";
import { UTRECHT_SEEDS } from "@/lib/ingest/curated/utrecht";

seedCuratedDetails(
  [
    ...AMSTERDAM_SEEDS,
    ...UTRECHT_SEEDS,
    ...ROTTERDAM_SEEDS,
    ...DEN_HAAG_SEEDS,
    ...EINDHOVEN_SEEDS,
    ...ALKMAAR_SEEDS,
    ...HAARLEM_SEEDS,
    ...GRONINGEN_SEEDS,
  ],
  console.log
).catch((err) => {
  console.error(err);
  process.exit(1);
});
