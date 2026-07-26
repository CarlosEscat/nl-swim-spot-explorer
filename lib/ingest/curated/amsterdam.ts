import type { DetailSeed } from "../curated-details";

/**
 * Hand-curated facilities/hours for the featured Amsterdam-area spots.
 *
 * Sources: groengebied-amstelland.nl, twiske-waterland.nl / recreatienoordholland.nl,
 * amsterdam.nl and iamsterdam.com swim-spot pages (checked July 2026).
 * Unknown fields stay null — the UI shows "unknown" rather than a guess.
 * All official NL spots are quality-monitored 1 May – 1 Oct; none of these
 * has permanent water supervision unless noted.
 */
export const AMSTERDAM_SEEDS: DetailSeed[] = [
  {
    name: "Gaasperplas Noord",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    dogs_allowed: true,
    access_notes_nl:
      "Vrij toegankelijk, gratis. Strand en gazons op de noordoever van de Gaasperplas; horeca bij de metro-ingang Gaasperplas. Honden: op het recreatiestrand niet toegestaan van 15 april tot 15 oktober (ook niet aangelijnd); daarbuiten aangelijnd. Op de westoever een aangewezen hondenstrand en losloopgebied, het hele jaar. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Open access, free. Beach and lawns on the north shore of the Gaasperplas; horeca near the Gaasperplas metro entrance. Dogs: not allowed on the recreation beach from 15 Apr to 15 Oct (not even leashed); leashed outside that period. A designated dog beach and off-leash area on the west shore, year-round. No water supervision. Water quality monitored 1 May – 1 Oct.",
  },
  {
    name: "Gaasperplas Zuid",
    has_restrooms: true,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    dogs_allowed: true,
    access_notes_nl:
      "Vrij toegankelijk, gratis. Strand op de zuidoever met een toiletgebouw (~50 m) en horeca. Aangewezen naaktstrand elders aan het meer (parkzijde; gesloten wegens renovatie tot 12 juni 2026 — tijdelijk alternatief aan de zuidwestoever). Honden: op het recreatiestrand niet toegestaan van 15 april tot 15 oktober (ook niet aangelijnd); daarbuiten aangelijnd. Op de westoever een aangewezen hondenstrand en losloopgebied, het hele jaar. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Open access, free. South-shore beach with a toilet building (~50 m) and horeca. Designated nude beach elsewhere on the lake (park side; closed for renovation until 12 June 2026 — temporary alternative on the southwest bank). Dogs: not allowed on the recreation beach from 15 Apr to 15 Oct (not even leashed); leashed outside that period. A designated dog beach and off-leash area on the west shore, year-round. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "IJburg",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Strand IJburg (Blijburg). Vrij toegankelijk, gratis, kunstmatig zandstrand; populair bij windsurfers en suppers. Het voormalige strandpaviljoen Blijburg is gesloten — eten/toiletten wisselen per seizoen. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Strand IJburg (Blijburg). Open access, free, man-made sandy beach; popular with windsurfers and paddlers. The former Blijburg beach pavilion closed — food/toilet availability varies by season. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Nieuwe Meer Noord",
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    dogs_allowed: true,
    access_notes_nl:
      "Vrij toegankelijk, gratis. Noordoever bij het Amsterdamse Bos, inclusief de officiële zwemsteiger. Honden: toegestaan (aangelijnd); in de aangrenzende Oeverlanden zijn losloopzones — let op de borden. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Open access, free. North shore by the Amsterdamse Bos, includes the official swim dock (steiger). Dogs: allowed (leashed); the adjacent Oeverlanden has off-leash zones — check the signs. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Nieuwe Meer West",
    has_restrooms: null,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: true,
    lounging_area: true,
    dogs_allowed: true,
    access_notes_nl:
      "De Oeverlanden, westoever van de Nieuwe Meer. Vrij toegankelijk, gratis. Van oudsher een naaktrecreatiegebied; natuurlijke oevers, geen voorzieningen aan het water. Honden: toegestaan; de Oeverlanden heeft losloopzones, elders aangelijnd — let op de borden. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "De Oeverlanden, west bank of the Nieuwe Meer. Open access, free. Long-established naturist recreation area; natural banks, no facilities on the shore. Dogs: allowed; the Oeverlanden has off-leash zones, leashed elsewhere — check the signs. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Diemerpark",
    has_restrooms: false,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Klein rustig strandje in het Diemerpark aan het IJmeer, ten oosten van IJburg. Vrij toegankelijk, gratis, geen voorzieningen — neem zelf mee wat je nodig hebt. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Small quiet beach in the Diemerpark on the IJmeer, east of IJburg. Open access, free, no facilities — bring what you need. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Marineterrein",
    has_restrooms: null,
    has_catering: true,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Binnenhaven op het Marineterrein — de eerste officiële zwemplek in het centrum van Amsterdam (aangewezen in 2025). Toegang tot het water via trapjes/ladders; diep water, niet geschikt voor kleine kinderen. Cafés op het terrein. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Binnenhaven at the Marineterrein — the first official swim spot in central Amsterdam (designated 2025). Quay access via steps/ladders; deep water, not suitable for small children. Cafés on the grounds. No water supervision. Monitored 1 May – 1 Oct.",
  },
  {
    name: "Twiske Baaiegat",
    has_restrooms: true,
    has_catering: false,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: true,
    lounging_area: true,
    dogs_allowed: false,
    access_notes_nl:
      "Naaktstrand op een schiereiland in Het Twiske, bereikbaar via een klein bruggetje. Openbaar toilet, volleybal- en jeu-de-boulesveld; geen horeca — neem zelf mee. Geleidelijk aflopend strand, ondiepe zone gemarkeerd met boeien. Geen barbecue, geen honden (honden mogen wel te water bij de zwemstranden Kure-Jan en de Leers elders in Het Twiske). Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Naturist beach on a peninsula in Het Twiske, reached via a small bridge. Public toilet, volleyball and jeu-de-boules; no horeca — bring your own. Gently sloping beach, shallow zone marked by buoys. No BBQ, no dogs (dogs may swim at the Kure-Jan and de Leers swim beaches elsewhere in Het Twiske). No water supervision. Monitored 1 May – 1 Oct.",
  },
  ...[
    "Twiske Does",
    "Twiske Kure-Jan",
    "Twiske Leers",
    "Twiske Poort",
    "Twiske Schoorlstrand",
    "Twiske Speelsloot",
    "Twiske Vennegatstrand",
  ].map((name) => ({
    name,
    has_restrooms: null,
    has_catering: null,
    has_lifeguard: false,
    has_boat_ramp: false,
    nude_recreation: false,
    lounging_area: true,
    access_notes_nl:
      "Strand in recreatiegebied Het Twiske (vrij toegankelijk; parkeren is betaald). Voorzieningen verschillen per strand — toiletten en horeca centraal in het park. Geen toezicht op het water. Waterkwaliteit gecontroleerd van 1 mei tot 1 oktober.",
    access_notes_en:
      "Beach in recreation area Het Twiske (open access; parking is paid). Facilities vary per beach — toilets and horeca available centrally in the park. No water supervision. Monitored 1 May – 1 Oct.",
  })),
];
