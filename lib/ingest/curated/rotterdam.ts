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
    dogs_allowed: true,
    access_notes_nl:
      "Stadsplas in het Kralingse Bos. Kleine strandjes en gazons op de noordoever, cafés en restaurants rond de plas. Vrij toegankelijk, gratis. Gevoelig voor blauwalg bij warm weer — check de actuele status hierboven. Honden: aan de kop van het hoofdstrand een hondenstrand waar honden het hele jaar los mogen en kunnen zwemmen; op de recreatiestranden niet toegestaan van 1 april tot 1 oktober, elders in het Kralingse Bos aangelijnd. Opruimplicht. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "City lake in the Kralingse Bos. Small beaches and lawns on the north shore, cafés and restaurants around the lake. Open access, free. Prone to blue-green algae in warm spells — check the current status above. Dogs: at the head of the main beach there is a dog beach where dogs may run off-leash and swim year-round; not allowed on the recreation beaches from 1 Apr to 1 Oct, leashed elsewhere in the Kralingse Bos. Clean-up required. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Kralinger Esch",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    dogs_allowed: true,
    access_notes_nl:
      "Noordoosthoek van de Kralingse Plas bij de velden van Kralinger Esch. Gazons en natuurlijke oevers; horeca elders rond de plas. Vrij toegankelijk, gratis. Honden: in het parkdeel mogen honden het hele jaar los, behalve langs de directe oever (Plaszoom) waar aanlijnen geldt; het hondenstrand ligt aan de kop van het hoofdstrand. Opruimplicht. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Northeast corner of the Kralingse Plas by the Kralinger Esch fields. Lawns and natural banks; horeca elsewhere around the lake. Open access, free. Dogs: in the park dogs may be off-leash year-round, except along the immediate lake edge (Plaszoom) where leashing applies; the dog beach is at the head of the main beach. Clean-up required. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "'t Zwarte Plasje",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Klein, beschut zwemplasje in Hillegersberg (Rotterdam-Noord) met een strandje en gazons — een buurtinstituut, populair bij gezinnen. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Stadsstrand aan de Zevenhuizerplas bij Nesselande, vlak bij het metro-eindpunt Nesselande: boulevard met horeca, toiletten en watersportverhuur. Vrij toegankelijk, gratis. Toezicht alleen op sommige drukke zomerdagen — check de borden ter plaatse. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Rustiger zandstrand op de noordwestoever van de Zevenhuizerplas, weg van de boulevard van Nesselande; horeca aan de kant van Nesselande. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    dogs_allowed: true,
    access_notes_nl:
      "Breed Noordzeestrand bij Hoek van Holland met strandpaviljoens en volledige voorzieningen in het seizoen; directe metro (lijn B, Hoek van Holland Strand). Reddingsbrigade aanwezig in het hoogseizoen — zwem tussen de vlaggen en blijf ver bij de vaargeul van de Nieuwe Waterweg bij de pier vandaan. Honden: buiten het badseizoen (1 okt–1 mei) de hele dag los op het badstrand; van 1 mei tot 1 oktober overdag (9–19 u) niet, behalve op het hondenstrand bij de pier waar honden het hele jaar los mogen. Opruimplicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Broad North Sea beach at Hoek van Holland with beach pavilions and full facilities in season; direct metro (line B, Hoek van Holland Strand). Lifeguard posts in the summer season — swim between the flags and stay well clear of the Nieuwe Waterweg shipping channel by the pier. Dogs: off-season (1 Oct–1 May) off-leash all day on the main beach; from 1 May to 1 Oct not during the day (09:00–19:00), except on the dog beach by the pier where dogs may run off-leash year-round. Clean-up required. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Bleiswijkse Zoom",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Strand en gazons in recreatiegebied Bleiswijkse Zoom aan de Rottemeren, ten noordoosten van Rotterdam. Vrij toegankelijk, gratis; parkeren bij het recreatiegebied. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Beach and lawns in recreation area Bleiswijkse Zoom at the Rottemeren, northeast of Rotterdam. Open access, free; parking at the recreation area. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
