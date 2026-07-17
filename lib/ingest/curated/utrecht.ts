import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Utrecht-area spots.
 *
 * Sources: recreatiemiddennederland.nl, utrecht.nl swim pages and the
 * operators' own sites (checked July 2026). Unknown fields stay null.
 */
export const UTRECHT_SEEDS: DetailSeed[] = [
  {
    name: "Haarrijnse Plas",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Sandy beach on the Haarrijnse Plas at Vleuten, on Utrecht's northwest edge. Open access, free; parking along the lake fills up fast on hot days. Kitesurfers use the northern shore. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Strijkviertelplas",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Recreation lake in De Meern (Utrecht-West) with a sandy beach, big lawns and beach volleyball. Open access, free. Hosts festivals on some summer weekends — the beach can be (partly) closed then. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Down Under (Plas Laagraven)",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Leisure lake at Laagraven on the Utrecht/Nieuwegein border, home of the Down Under beach club: cable wakeboarding, aqua park, beach volleyball, restaurant and terraces. The swimming beach itself is free; activities and parking are paid. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Maarsseveense Plassen Strandbad",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Managed strandbad on the Maarsseveense Plassen just north of Utrecht: sandy beach, lawns, toilets and horeca in season; paid parking. Deep, clear water — supervision only on busy summer days, check on-site signs. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Maarsseveense Plassen Zuidhoek",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes:
      "Free southern corner of the Maarsseveense Plassen, outside the managed strandbad. Natural banks and lawns with few facilities of its own. Deep water. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
