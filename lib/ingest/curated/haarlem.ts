import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated details for the Haarlem region: the Kennemer coast
 * (Zandvoort, Bloemendaal, IJmuiden), the dune lakes and the Haarlemmermeer
 * recreation lakes.
 *
 * Sources: zandvoort.nl, np-zuidkennemerland.nl, spaarnwoude.nl and
 * haarlemmermeer.nl area pages (checked July 2026). Unknown fields stay null.
 */
export const HAARLEM_SEEDS: DetailSeed[] = [
  {
    name: "Zandvoort",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: true,
    has_boat_ramp: false,
    nude_recreation: null,
    lounging_area: true,
    access_notes_nl:
      "Groot Noordzeebadstrand, rechtstreeks per trein vanuit Haarlem en Amsterdam (station Zandvoort aan Zee bij de boulevard). Tientallen paviljoens en volledige voorzieningen in het seizoen. Reddingsbrigade aanwezig in het hoogseizoen — zwem tussen de vlaggen en let op muistromen. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Major North Sea resort beach, a direct train ride from Haarlem and Amsterdam (station Zandvoort aan Zee at the boulevard). Dozens of pavilions and full facilities in season. Lifeguard posts in the summer season — swim between the flags and mind rip currents. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Bloemendaal",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: true,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Bloemendaal aan Zee: breed Noordzeestrand bekend om zijn strandclubs, ten noorden van Zandvoort. Reddingsbrigade aanwezig in het hoogseizoen — zwem tussen de vlaggen en let op muistromen. Betaald parkeren achter de duinen. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Bloemendaal aan Zee: wide North Sea beach known for its beach clubs, north of Zandvoort. Lifeguard posts in the summer season — swim between the flags and mind rip currents. Paid parking behind the dunes. Monitored 1 May – 1 Oct.",
  },
  {
    name: "'t Wed",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Ondiep duinmeertje 't Wed in Nationaal Park Zuid-Kennemerland (Overveen) — een familiefavoriet op warme dagen. Te bereiken te voet of per fiets vanaf ingang Koevlak; daar betaald parkeren. Geen voorzieningen aan het water. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Shallow dune lake at 't Wed in Nationaal Park Zuid-Kennemerland (Overveen) — a family favourite on hot days. Reached on foot or by bike from the Koevlak entrance; paid parking there. No facilities at the water. No supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Oosterplas",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Duinmeer in de Amsterdamse Waterleidingduinen bij Vogelenzang, met natuurlijke oevers en gazons. Weinig voorzieningen — neem zelf mee wat je nodig hebt. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Dune lake in the Amsterdamse Waterleidingduinen area near Vogelenzang, with natural banks and lawns. Few facilities — bring what you need. No supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Veerplas",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Recreatieplas aan de oostrand van Haarlem, onderdeel van bufferzone Spaarnwoude: gazons, een klein strandje en picknickplekken. Vrij toegankelijk, gratis. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Recreation lake on Haarlem's east edge, part of the Spaarnwoude buffer zone: lawns, a small beach and picnic spots. Open access, free. No supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Molenplas",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Klein zwemplasje aan de zuidkant van Haarlem (Schalkwijk) met grasoevers. Vrij toegankelijk, gratis. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Small swimming lake on the south side of Haarlem (Schalkwijk) with grassy banks. Open access, free. No supervision. Monitored 1 May – 1 Oct.",
  },
  ...["Haarlemmermeerse Bos Plas", "Haarlemmermeerse Bos vijver"].map(
    (name) => ({
      name,
      has_restrooms: null,
      has_catering: null,
      has_lifeguard: false,
      has_boat_ramp: false,
      nude_recreation: false,
      lounging_area: true,
      access_notes_nl:
        "Zwemwater in het Haarlemmermeerse Bos bij Hoofddorp: zandstrand en grote gazons rond de recreatieplas. Gratis; betaald parkeren op drukke dagen. In sommige weekenden grote festivals — het park kan dan gedeeltelijk gesloten zijn. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
      access_notes_en:
        "Swimming water in the Haarlemmermeerse Bos at Hoofddorp: sandy beach and big lawns around the recreation lake. Free; paid parking on busy days. Hosts large festivals some weekends — the park can be partly closed then. No supervision. Monitored 1 May – 1 Oct.",
    })
  ),
  ...["Toolenburg Noord", "Toolenburg West"].map((name) => ({
    name,
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Strand aan de Toolenburgerplas in Hoofddorp: zand, gazons, een speeltuin en een skate-/activiteitenpark in de buurt. Vrij toegankelijk, gratis. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Beach on the Toolenburgerplas in Hoofddorp: sand, lawns, playground and a skate/activity park nearby. Open access, free. No supervision. Monitored 1 May – 1 Oct.",
  })),
  {
    name: "Westbroekplas",
    has_restrooms: null,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Recreatieplas in Spaarnwoude (Velsen-Zuid) met stranden en gazons; strandpaviljoen Villa Westend ligt aan de westoever. Gratis. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Recreation lake in Spaarnwoude (Velsen-Zuid) with beaches and lawns; the Villa Westend beach pavilion sits on the west shore. Free. No supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Villa Westend",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Stadsstrandplek bij paviljoen Villa Westend aan de Westbroekplas (Spaarnwoude): zandstrand met volledige horeca ernaast. Strand gratis; op het terras wordt consumptie verwacht. Geen toezicht. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "City-beach spot at the Villa Westend pavilion on the Westbroekplas (Spaarnwoude): sandy beach with full horeca alongside. Beach free; terrace consumption expected at the pavilion. No supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Kennemerstrand",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: null,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Breed strand bij IJmuiden aan Zee naast de jachthaven, populair bij kite- en windsurfers (aangewezen zones). Paviljoens in het seizoen. Blijf ver bij de havenhoofden vandaan — scheepvaart en sterke stroming. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Broad beach at IJmuiden aan Zee by the marina, popular with kite- and windsurfers (designated zones). Pavilions in season. Stay well clear of the harbor piers — shipping and strong currents. Monitored 1 May – 1 Oct.",
  },
];
