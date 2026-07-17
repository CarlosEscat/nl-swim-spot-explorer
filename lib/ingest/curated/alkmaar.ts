import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Alkmaar region (Geestmerambacht, Park van
 * Luna and the Alkmaardermeer).
 *
 * Sources: geestmerambacht.nl, dijkenwaard.nl and recreatie Noord-Holland
 * area pages (checked July 2026). Unknown fields stay null.
 */
export const ALKMAAR_SEEDS: DetailSeed[] = [
  ...[
    "Geestmerambacht baai 1",
    "Geestmerambacht baai 2",
    "Geestmerambacht baai 3",
    "Geestmerambacht baai 4",
    "Geestmerambacht baai 5",
    "Geestmerambacht baai 6",
    "Geestmerambacht baai 7",
    "Geestmerambacht baai 8",
  ].map((name) => ({
    name,
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "One of eight numbered swimming bays around the Zomerdel lake in recreation area Geestmerambacht, just north of Alkmaar. Sand and lawns; toilets and horeca at the central beach area. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  })),
  {
    name: "Park van Luna",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Swimming beach in Park van Luna at Stad van de Zon, Heerhugowaard: sandy city beach with lawns and playgrounds around the recreation lake. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Noorderplas",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Quieter recreation lake on the north side of Heerhugowaard with grassy banks and small beaches. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Akersloot",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Lake beach on the Alkmaardermeer at Akersloot. Busy sailing and motorboat water — stay inside the marked swim zone. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Dorregeest",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Beach and lawns on the Uitgeestermeer at Dorregeest (Uitgeest), by the recreation area and marina. Busy boating water — stay inside the marked swim zone. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
