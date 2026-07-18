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
    access_notes_nl:
      "Een van de acht genummerde zwembaaien rond de Zomerdel in recreatiegebied Geestmerambacht, net ten noorden van Alkmaar. Zand en gazons; toiletten en horeca bij het centrale strandgedeelte. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Zwemstrand in Park van Luna bij Stad van de Zon, Heerhugowaard: zandstrand met gazons en speeltoestellen rond de recreatieplas. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Rustiger recreatieplas aan de noordkant van Heerhugowaard met grasoevers en kleine strandjes. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Strandje aan het Alkmaardermeer bij Akersloot. Druk vaarwater voor zeil- en motorboten — blijf binnen de gemarkeerde zwemzone. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Strand en gazons aan het Uitgeestermeer bij Dorregeest (Uitgeest), naast het recreatiegebied en de jachthaven. Druk vaarwater — blijf binnen de gemarkeerde zwemzone. Gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Beach and lawns on the Uitgeestermeer at Dorregeest (Uitgeest), by the recreation area and marina. Busy boating water — stay inside the marked swim zone. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
