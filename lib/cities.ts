/**
 * Major NL cities for the explorer's city filter. Selecting one shows the
 * spots within CITY_RADIUS_KM of its center and flies the map there.
 * Module constants — object identity is stable, so they're safe to pass as
 * React props/effect deps.
 */
export interface City {
  id: string;
  name: string;
  /** English exonym, for the few cities where it differs (Den Haag → The Hague). */
  name_en?: string;
  lat: number;
  lng: number;
}

export const CITY_RADIUS_KM = 20;

export const CITIES: City[] = [
  { id: "alkmaar", name: "Alkmaar", lat: 52.6324, lng: 4.7534 },
  { id: "almere", name: "Almere", lat: 52.3508, lng: 5.2647 },
  { id: "amsterdam", name: "Amsterdam", lat: 52.3728, lng: 4.8936 },
  { id: "arnhem", name: "Arnhem", lat: 51.9851, lng: 5.8987 },
  { id: "breda", name: "Breda", lat: 51.5719, lng: 4.7683 },
  {
    id: "den-haag",
    name: "Den Haag",
    name_en: "The Hague",
    lat: 52.0705,
    lng: 4.3007,
  },
  { id: "eindhoven", name: "Eindhoven", lat: 51.4416, lng: 5.4697 },
  { id: "enschede", name: "Enschede", lat: 52.2215, lng: 6.8937 },
  { id: "groningen", name: "Groningen", lat: 53.2194, lng: 6.5665 },
  { id: "haarlem", name: "Haarlem", lat: 52.3874, lng: 4.6462 },
  { id: "leeuwarden", name: "Leeuwarden", lat: 53.2012, lng: 5.7999 },
  { id: "maastricht", name: "Maastricht", lat: 50.8514, lng: 5.691 },
  { id: "middelburg", name: "Middelburg", lat: 51.4988, lng: 3.6136 },
  { id: "nijmegen", name: "Nijmegen", lat: 51.8126, lng: 5.8372 },
  { id: "rotterdam", name: "Rotterdam", lat: 51.9225, lng: 4.4792 },
  { id: "tilburg", name: "Tilburg", lat: 51.5606, lng: 5.0919 },
  { id: "utrecht", name: "Utrecht", lat: 52.0907, lng: 5.1214 },
  { id: "zwolle", name: "Zwolle", lat: 52.5168, lng: 6.083 },
];
