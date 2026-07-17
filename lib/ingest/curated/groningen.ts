import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Groningen region: the city lakes plus the
 * Paterswoldsemeer, Zuidlaardermeer and Meerstad.
 *
 * Sources: groningen.nl, meerschap Paterswolde and Meerstad area pages
 * (checked July 2026). Unknown fields stay null.
 */
export const GRONINGEN_SEEDS: DetailSeed[] = [
  {
    name: "Hoornseplas, Groningen",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "The city's main swimming lake, on Groningen's south edge next to the Hoornsemeer: sandy beaches, big lawns and playgrounds; horeca in season. Open access, free; very busy on hot days. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Paterswoldsemeer de Lijte, Haren",
    has_restrooms: true,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Recreation beach De Lijte on the east shore of the Paterswoldsemeer (Haren side): sand, lawns and a playground. Busy sailing water — stay inside the marked swim zone. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Recreatieplas Kardinge, Groningen",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Swimming lake in recreation area Kardinge on Groningen's northeast edge, next to the Kardinge sports centre: beach, lawns and playgrounds. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Recreatieplas,Engelbert",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Recreation lake at Engelbert, southeast of the city: sandy beach and lawns in a quiet setting. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Stadsstrand Groningen",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Urban beach on the water's edge in Groningen city. Deep, open water close to boat traffic — stay inside the designated swim area. No water supervision. Monitored 1 May – 1 Oct.",
  },
  ...["Meeroevers Meerstad", "strand Zijlkade Meerstad"].map((name) => ({
    name,
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Sandy beach on the Woldmeer in the new Meerstad district east of Groningen. Lawns and playgrounds; facilities are still growing along with the neighbourhood. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  })),
  {
    name: "Zuidlaardermeer, Meerwijck",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Beach at Meerwijck (Kropswolde) on the northwest shore of the Zuidlaardermeer, by the marina and holiday park. Shallow near the shore; busy sailing water further out. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Grunostrand, Harkstede",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Beach on the Grunopark lake at Harkstede, east of Groningen: sand, lawns and water-sports use on the lake. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
