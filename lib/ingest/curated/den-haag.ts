import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Den Haag region (coast + inland recreation
 * lakes between Den Haag, Delft and Zoetermeer).
 *
 * Sources: denhaag.nl beach pages, staatsbosbeheer/recreatie Zuid-Holland
 * area pages and the operators' own sites (checked July 2026).
 * Unknown fields stay null.
 */
export const DEN_HAAG_SEEDS: DetailSeed[] = [
  {
    name: "Scheveningen Noorderstrand",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: true,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Main city beach of Scheveningen along the boulevard: dozens of pavilions, toilets and rentals; very busy on hot days. Lifeguard posts in the summer season — swim between the flags and mind rip currents near the pier and harbor heads. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Scheveningen Zwarte Pad",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "North end of Scheveningen beach at the Zwarte Pad: large beach clubs and surf schools. Mind rip currents around the pier. Supervised zones in season on the main beach further south. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Scheveningen Zuiderstrand",
    has_restrooms: null,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Quieter beach southwest of Scheveningen harbor, backed by dunes; a handful of pavilions. Stay well clear of the harbor entrance — shipping and strong currents around the zuiderhavenhoofd. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Den Haag Kijkduin",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: true,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Family beach at Kijkduin with a renovated boulevard and pavilions; calmer than Scheveningen. Lifeguard post in the summer season — swim between the flags. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Zandmotor",
    has_restrooms: false,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: null,
    lounging_area: null,
    access_notes:
      "Man-made sand peninsula between Ter Heijde and Kijkduin, built as a coastal-replenishment experiment. Bare beach without facilities. Currents around the tip and the lagoon are strong and unpredictable — swim only near the regular beach sections and heed on-site flags. Monitored 1 May – 1 Oct.",
  },
  ...[
    "Plassen Madestein, Loosduinen",
    "Plassen Madestein, Noordzijde",
    "Plassen Madestein, Zuidzijde",
  ].map((name) => ({
    name,
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Recreation lakes in park Madestein, Loosduinen (Den Haag-Zuidwest). Beaches, lawns and playgrounds; free. No water supervision. Monitored 1 May – 1 Oct.",
  })),
  {
    name: "Vlietland Badstrand Noordoostoever",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Main swimming beach of recreation area Vlietland between Den Haag and Leiden: sand, big lawns, horeca in season; paid parking. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Vlietland Surfstrand Noordwestoever",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Northwest shore of Vlietland, shared with windsurfers and SUP launches — keep clear of the launch lanes. Lawns and sand; facilities at the main beach. Paid parking. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Vlietland Speelvijver",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Shallow play pond in recreation area Vlietland, meant for small children. Lawns around the water; facilities at the main beach. Paid parking. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Noord Aa Zwemstrand",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Family beach on the Noord Aa polder lake on the north edge of Zoetermeer: sand, lawns and a playground; horeca nearby at the marina side. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Noord Aa Naaktstrand",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: true,
    lounging_area: true,
    access_notes:
      "Designated naturist beach on the Noord Aa, separate from the family beach. Free, few facilities. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Delftse Hout",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Recreation lake in the Delftse Hout just east of Delft: sandy beach, lawns and a playground; horeca in the park in season. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
