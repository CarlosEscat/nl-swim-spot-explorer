import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Eindhoven region (Genneper Parken + the
 * recreation lakes ringing the city).
 *
 * Sources: eindhoven.nl, the operators' own sites (checked July 2026).
 * Unknown fields stay null. Several lakes here sit at commercial leisure
 * parks — access rules change, so notes point visitors to the operator.
 */
export const EINDHOVEN_SEEDS: DetailSeed[] = [
  {
    name: "De IJzeren Man, Eindhoven",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Classic 1920s swimming lake in the Genneper Parken on Eindhoven's south side: sandy banks, lawns and woodland shade. Open access, free. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "De IJzeren Man kleine bad",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Shallow children's basin next to the main IJzeren Man lake in the Genneper Parken — suited to small children, but there is no water supervision. Free. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Aquabest",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Large leisure lake at Best, just northwest of Eindhoven: sandy beach with a beach club, water-sports rental and paid parking. Hosts big festivals some summer weekends — the beach can be closed then; check the operator's site. Monitored 1 May – 1 Oct.",
  },
  ...["E-3 Strand (Lob 1)", "E-3 Strand (Lob 2)", "E-3 Kleine Plas"].map(
    (name) => ({
      name,
      has_restrooms: true,
      has_catering: true,
      has_lifeguard: null,
      has_boat_ramp: false,
      nude_recreation: false,
      lounging_area: true,
      access_notes:
        "Part of commercial beach park E3 Strand near Eersel: broad sandy beaches, playgrounds and horeca. Day admission and parking are paid in season; festival weekends can close the park — check the operator's site. Monitored 1 May – 1 Oct.",
    })
  ),
  {
    name: "Het Wolfsven",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Fen lake with sandy edges at holiday park Het Wolfsven in Mierlo, east of Eindhoven. Primarily for park guests — check the park's rules for day access. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "'T Witven",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Fen swimming lake at the Witven venue in Veldhoven, southwest of Eindhoven. Operated privately — opening hours and access rules are set by the venue; check before you go. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
