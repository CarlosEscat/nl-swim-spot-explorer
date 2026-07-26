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
    dogs_allowed: true,
    access_notes_nl:
      "De belangrijkste zwemplas van de stad, aan de zuidrand van Groningen naast het Hoornsemeer: zandstranden, grote gazons en speeltuinen; horeca in het seizoen. Vrij toegankelijk, gratis; erg druk op warme dagen. Honden: langs de plas alleen toegestaan van 1 oktober tot 1 april (ma–vr los, weekend aangelijnd); van 1 april tot 1 oktober niet, behalve op twee aangewezen uitrenplaatsen die het hele jaar open zijn. Opruimplicht. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "The city's main swimming lake, on Groningen's south edge next to the Hoornsemeer: sandy beaches, big lawns and playgrounds; horeca in season. Open access, free; very busy on hot days. Dogs: allowed along the lake only from 1 Oct to 1 Apr (Mon–Fri off-leash, weekends leashed); from 1 Apr to 1 Oct not allowed, except at two designated dog runs open year-round. Clean-up required. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Paterswoldsemeer de Lijte, Haren",
    has_restrooms: true,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    dogs_allowed: true,
    access_notes_nl:
      "Recreatiestrand De Lijte aan de oostoever van het Paterswoldsemeer (kant Haren): zand, gazons en een speeltuin. Druk vaarwater — blijf binnen de gemarkeerde zwemzone. Gratis. Honden: bij De Lijte toegestaan; let op de borden voor aanlijn- en zwemzones. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Recreation beach De Lijte on the east shore of the Paterswoldsemeer (Haren side): sand, lawns and a playground. Busy sailing water — stay inside the marked swim zone. Free. Dogs: allowed at De Lijte; check the signs for leash and swim zones. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Recreatieplas Kardinge, Groningen",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Zwemplas in recreatiegebied Kardinge aan de noordoostrand van Groningen, naast sportcentrum Kardinge: strand, gazons en speeltuinen. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Recreatieplas bij Engelbert, ten zuidoosten van de stad: zandstrand en gazons op een rustige plek. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Stadsstrand aan het water in de stad Groningen. Diep, open water dicht bij scheepvaart — blijf binnen de aangewezen zwemzone. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Zandstrand aan het Woldmeer in de nieuwe wijk Meerstad, ten oosten van Groningen. Gazons en speeltuinen; voorzieningen groeien mee met de wijk. Vrij toegankelijk, gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Strand bij Meerwijck (Kropswolde) aan de noordwestoever van het Zuidlaardermeer, naast de jachthaven en het vakantiepark. Ondiep bij de oever; verderop druk vaarwater. Gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
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
    access_notes_nl:
      "Strand aan de Grunoplas bij Harkstede, ten oosten van Groningen: zand, gazons en watersport op de plas. Gratis. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Beach on the Grunopark lake at Harkstede, east of Groningen: sand, lawns and water-sports use on the lake. Free. No water supervision. Monitored 1 May – 1 Oct.",
  },
];
