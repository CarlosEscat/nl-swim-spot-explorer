import "./lib/env";
import { getStore } from "@/lib/db/store";
import { nameKey } from "@/lib/slug";
import type { SwimSpotDetails } from "@/lib/types";

/**
 * Hand-curated facilities/hours for the featured Amsterdam-area spots.
 *
 * Sources: groengebied-amstelland.nl, twiske-waterland.nl / recreatienoordholland.nl,
 * amsterdam.nl and iamsterdam.com swim-spot pages (checked July 2026).
 * Unknown fields stay null — the UI shows "unknown" rather than a guess.
 * All official NL spots are quality-monitored 1 May – 1 Oct; none of these
 * has permanent water supervision unless noted.
 */
type DetailSeed = Omit<SwimSpotDetails, "spot_id"> & { name: string };

const SEEDS: DetailSeed[] = [
  {
    name: "Gaasperplas Noord",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Open access, free. Beach and lawns on the north shore of the Gaasperplas; horeca near the Gaasperplas metro entrance. No water supervision. Water quality monitored 1 May – 1 Oct.",
  },
  {
    name: "Gaasperplas Zuid",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Open access, free. South-shore beach with a toilet building (~50 m) and horeca. Designated nude beach elsewhere on the lake (park side; closed for renovation until 12 June 2026 — temporary alternative on the southwest bank). No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "IJburg",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Strand IJburg (Blijburg). Open access, free, man-made sandy beach; popular with windsurfers and paddlers. The former Blijburg beach pavilion closed — food/toilet availability varies by season. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Nieuwe Meer Noord",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Open access, free. North shore by the Amsterdamse Bos, includes the official swim dock (steiger). No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Nieuwe Meer West",
    has_restrooms: null,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: true,
    lounging_area: true,
    access_notes:
      "De Oeverlanden, west bank of the Nieuwe Meer. Open access, free. Long-established naturist recreation area; natural banks, no facilities on the shore. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Diemerpark",
    has_restrooms: false,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Small quiet beach in the Diemerpark on the IJmeer, east of IJburg. Open access, free, no facilities — bring what you need. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Marineterrein",
    has_restrooms: null,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Binnenhaven at the Marineterrein — the first official swim spot in central Amsterdam (designated 2025). Quay access via steps/ladders; deep water, not suitable for small children. Cafés on the grounds. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Twiske Baaiegat",
    has_restrooms: true,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: true,
    lounging_area: true,
    access_notes:
      "Naturist beach on a peninsula in Het Twiske, reached via a small bridge. Public toilet, volleyball and jeu-de-boules; no horeca — bring your own. Gently sloping beach, shallow zone marked by buoys. No BBQ, no dogs. No water supervision. Monitored 1 May – 1 Oct.",
  },
  ...[
    "Twiske Does",
    "Twiske Kure-Jan",
    "Twiske Leers",
    "Twiske Poort",
    "Twiske Schoorlstrand",
    "Twiske Speelsloot",
    "Twiske Vennegatstrand",
  ].map((name) => ({
    name,
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Beach in recreation area Het Twiske (open access; parking is paid). Facilities vary per beach — toilets and horeca available centrally in the park. No water supervision. Monitored 1 May – 1 Oct.",
  })),
];

async function main() {
  const store = await getStore();
  console.log(`Store: ${store.name}`);

  const spots = await store.getSpots();
  const byKey = new Map(spots.map((s) => [nameKey(s.name), s]));

  const details: SwimSpotDetails[] = [];
  for (const seed of SEEDS) {
    const spot = byKey.get(nameKey(seed.name));
    if (!spot) {
      console.warn(`⚠ No spot found for "${seed.name}" — run ingest-locations first.`);
      continue;
    }
    details.push({
      spot_id: spot.id,
      has_restrooms: seed.has_restrooms,
      has_catering: seed.has_catering,
      has_lifeguard: seed.has_lifeguard,
      has_boat_ramp: seed.has_boat_ramp,
      nude_recreation: seed.nude_recreation,
      lounging_area: seed.lounging_area,
      access_notes: seed.access_notes,
      facilities_source: "manual",
    });
  }
  await store.upsertDetails(details);
  console.log(`Seeded details for ${details.length}/${SEEDS.length} featured spots.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
