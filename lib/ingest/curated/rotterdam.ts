import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Rotterdam-area spots.
 *
 * Sources: rotterdam.nl swim pages, recreatieschap Rottemeren and the
 * operators' own sites (checked July 2026). Unknown fields stay null.
 */
export const ROTTERDAM_SEEDS: DetailSeed[] = [
  {
    name: "Kralingse Plas",
    has_restrooms: null,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "City lake in the Kralingse Bos. Small beaches and lawns on the north shore, cafés and restaurants around the lake. Open access, free. Prone to blue-green algae in warm spells — check the current status above. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Kralinger Esch",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Northeast corner of the Kralingse Plas by the Kralinger Esch fields. Lawns and natural banks; horeca elsewhere around the lake. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "'t Zwarte Plasje",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Small, sheltered swimming pond in Hillegersberg (Rotterdam-Noord) with a beach and lawns — a local institution, popular with families. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Zevenhuizerplas Nesselande",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Urban beach on the Zevenhuizerplas at Nesselande, right by the Nesselande metro terminus: boulevard with horeca, toilets and water-sports rental. Open access, free. Supervision only on some busy summer days — check on-site signs. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Zevenhuizerplas Strand Noordwestzijde",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Quieter sandy beach on the northwest shore of the Zevenhuizerplas, away from the Nesselande boulevard; horeca on the Nesselande side. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Hoek van Holland",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: true,
    has_boat_ramp: false,
    nude_recreation: null,
    lounging_area: true,
    access_notes:
      "Broad North Sea beach at Hoek van Holland with beach pavilions and full facilities in season; direct metro (line B, Hoek van Holland Strand). Lifeguard posts in the summer season — swim between the flags and stay well clear of the Nieuwe Waterweg shipping channel by the pier. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Bleiswijkse Zoom",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Beach and lawns in recreation area Bleiswijkse Zoom at the Rottemeren, northeast of Rotterdam. Open access, free; parking at the recreation area. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
