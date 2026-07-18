import { getStore } from "@/lib/db/store";
import { haversineKm } from "@/lib/geo";
import { slugify } from "@/lib/slug";
import type { SwimSpot, SwimSpotDetails, WaterType } from "@/lib/types";

/** Same cap as the station linker: beyond this a reading is meaningless. */
const MAX_STATION_KM = 25;

/**
 * Hand-curated, widely-used swim spots that are NOT official (PDOK-designated)
 * bathing locations. They carry official_status "unofficial": no zwemwater.nl
 * monitoring applies, and the UI flags them as swim-at-your-own-risk.
 *
 * Coordinates checked against OpenStreetMap (July 2026). To add a spot, append
 * an entry here and run `npm run seed:unofficial`.
 */
interface UnofficialSeed {
  name: string;
  lat: number;
  lng: number;
  province: string;
  municipality: string;
  water_type: WaterType;
  details: Omit<SwimSpotDetails, "spot_id" | "facilities_source" | "updated_at">;
}

export const UNOFFICIAL_SPOTS: UnofficialSeed[] = [
  {
    name: "Weesperzijde Stadsstrand",
    lat: 52.35,
    lng: 4.9103,
    province: "Noord-Holland",
    municipality: "Amsterdam",
    water_type: "river",
    details: {
      has_restrooms: false,
      has_catering: null,
      has_lifeguard: false,
      has_boat_ramp: false,
      nude_recreation: false,
      lounging_area: true,
      access_notes_nl:
        "Klein stadsstrandje op de oostoever van de Amstel tussen de Ruyschstraat en de Berlagebrug, ontzettend populair op warme dagen. Geen officiële zwemlocatie: de Amstel is druk vaarwater en de waterkwaliteit wordt niet gecontroleerd. Blijf dicht bij de kant en let op scheepvaart. Cafés langs de Weesperzijde.",
      access_notes_en:
        "Small city 'beach' on the east bank of the Amstel between the Ruyschstraat and the Berlagebrug, hugely popular on hot days. Not an official swimming location: the Amstel is active boating water and quality is not monitored. Stay close to the bank and watch for boat traffic. Cafés along the Weesperzijde.",
    },
  },
  {
    name: "Borneo-eiland Entrepothaven",
    lat: 52.371,
    lng: 4.943,
    province: "Noord-Holland",
    municipality: "Amsterdam",
    water_type: "river",
    details: {
      has_restrooms: false,
      has_catering: null,
      has_lifeguard: false,
      has_boat_ramp: false,
      nude_recreation: false,
      lounging_area: false,
      access_notes_nl:
        "Kades en steigers langs de Borneokade (Entrepothaven) in de Oostelijke Handelskade, een lokale favoriet voor een snelle duik. Geen officiële zwemlocatie — geen controle op waterkwaliteit. Blijf uit de buurt van afgemeerde en passerende boten, en check op een ladder of trapje voordat je erin springt: uitstapplekken zijn schaars.",
      access_notes_en:
        "Quays and jetties along the Borneokade (Entrepothaven) in the Eastern Docklands, a local favourite for a quick plunge. Not an official swimming location — no quality monitoring. Keep clear of moored and passing boats, and check for a ladder or steps before jumping in: exits are scarce.",
    },
  },
  {
    name: "Noorder IJplas",
    lat: 52.422,
    lng: 4.867,
    province: "Noord-Holland",
    municipality: "Amsterdam",
    water_type: "lake",
    details: {
      has_restrooms: false,
      has_catering: false,
      has_lifeguard: false,
      has_boat_ramp: false,
      nude_recreation: null,
      lounging_area: true,
      access_notes_nl:
        "Rustige plas tussen Amsterdam-Noord en Zaandam, gebruikt om wild te zwemmen vanaf de natuurlijke oevers. Geen officiële zwemlocatie: onbewaakt diep water, geen voorzieningen, geen controle op waterkwaliteit. Check bij warm weer op blauwalg voordat je erin gaat.",
      access_notes_en:
        "Quiet lake between Amsterdam-Noord and Zaandam, used for wild swimming from the natural banks. Not an official swimming location: unsupervised deep water, no facilities, no quality monitoring. In warm spells check for blue-green algae before getting in.",
    },
  },
  {
    name: "Merwedekanaal Muntbrug",
    lat: 52.086,
    lng: 5.095,
    province: "Utrecht",
    municipality: "Utrecht",
    water_type: "river",
    details: {
      has_restrooms: false,
      has_catering: null,
      has_lifeguard: false,
      has_boat_ramp: false,
      nude_recreation: false,
      lounging_area: true,
      access_notes_nl:
        "Zwemmen in de gracht vanaf de kades rond de Muntbrug en Muntsluis, een bekende Utrechtse zomerhangplek. Geen officiële zwemlocatie — het kanaal is vaarwater en de waterkwaliteit wordt niet getest. Let op scheepvaart en gebruik de kadetrappen of ladders om eruit te komen.",
      access_notes_en:
        "Canal swimming off the quays around the Muntbrug and Muntsluis, a well-known Utrecht summer hangout. Not an official swimming location — the canal is boating water and quality is untested. Mind boat traffic and use the quay steps or ladders to get out.",
    },
  },
];

export interface SeedUnofficialResult {
  seeded: number;
  linked: number;
}

/**
 * Upsert the curated unofficial spots (idempotent, keyed by slug) plus their
 * hand-written details, and link each to its nearest live RWS station when
 * the station list has already been seeded.
 */
export async function seedUnofficialSpots(
  log: (msg: string) => void = () => {}
): Promise<SeedUnofficialResult> {
  const store = await getStore();
  log(`Store: ${store.name}`);

  const spots = UNOFFICIAL_SPOTS.map<Omit<SwimSpot, "id" | "created_at" | "updated_at">>(
    (seed) => ({
      name: seed.name,
      slug: slugify(seed.name),
      province: seed.province,
      municipality: seed.municipality,
      lat: seed.lat,
      lng: seed.lng,
      water_type: seed.water_type,
      official_status: "unofficial",
      is_featured: false,
      nearest_rws_station_id: null,
      webcam_url: null,
    })
  );
  await store.upsertSpots(spots as SwimSpot[]);

  // Resolve the ids the store assigned, then attach details + nearest station.
  const bySlug = new Map((await store.getSpots()).map((s) => [s.slug, s]));
  const stations = await store.getStations();

  let linked = 0;
  const details: SwimSpotDetails[] = [];
  for (const seed of UNOFFICIAL_SPOTS) {
    const spot = bySlug.get(slugify(seed.name));
    if (!spot) continue;
    details.push({ spot_id: spot.id, ...seed.details, facilities_source: "manual" });

    if (stations.length > 0) {
      let bestId: string | null = null;
      let bestKm = Infinity;
      for (const st of stations) {
        const km = haversineKm(spot.lat, spot.lng, st.lat, st.lng);
        if (km < bestKm) {
          bestKm = km;
          bestId = st.id;
        }
      }
      if (bestId && bestKm <= MAX_STATION_KM) {
        await store.setNearestStation(spot.id, bestId);
        linked++;
      }
    }
  }
  await store.upsertDetails(details);

  log(
    `Seeded ${details.length} unofficial spots` +
      (stations.length > 0
        ? `; linked ${linked} to a live water-temp station.`
        : "; no stations in store yet — run seed:stations to link water temps.")
  );
  return { seeded: details.length, linked };
}
