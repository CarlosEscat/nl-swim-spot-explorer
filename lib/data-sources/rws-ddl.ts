import type { RwsStation } from "@/lib/types";

// Rijkswaterstaat WaterWebservices 2.0 ("Wadar"), the successor of
// waterwebservices.rijkswaterstaat.nl (classic API retired April 2026).
const BASE = "https://ddapi20-waterwebservices.rijkswaterstaat.nl";
const HEADERS = {
  "Content-Type": "application/json",
  // Not required today; RWS asks integrators to send one to ease debugging.
  "X-API-KEY": "nl-swim-spot-explorer",
};

interface CatalogusResponse {
  Succesvol: boolean;
  AquoMetadataLijst: {
    AquoMetadata_MessageID: number;
    Grootheid?: { Code: string };
    Compartiment?: { Code: string };
  }[];
  AquoMetadataLocatieLijst: {
    AquoMetaData_MessageID: number;
    Locatie_MessageID: number;
  }[];
  LocatieLijst: {
    Locatie_MessageID: number;
    Code: string;
    Naam: string;
    Lat: number;
    Lon: number;
  }[];
}

/** All RWS stations that measure surface-water temperature (Grootheid T, Compartiment OW). */
export async function fetchWaterTempStations(): Promise<RwsStation[]> {
  const res = await fetch(`${BASE}/METADATASERVICES/OphalenCatalogus`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      CatalogusFilter: { Grootheden: true, Compartimenten: true },
    }),
  });
  if (!res.ok) throw new Error(`RWS catalogus failed: ${res.status}`);
  const json = (await res.json()) as CatalogusResponse;
  if (!json.Succesvol) throw new Error("RWS catalogus returned Succesvol=false");

  const waterTempMetaIds = new Set(
    json.AquoMetadataLijst.filter(
      (m) => m.Grootheid?.Code === "T" && m.Compartiment?.Code === "OW"
    ).map((m) => m.AquoMetadata_MessageID)
  );
  const stationIds = new Set(
    json.AquoMetadataLocatieLijst.filter((k) =>
      waterTempMetaIds.has(k.AquoMetaData_MessageID)
    ).map((k) => k.Locatie_MessageID)
  );
  return json.LocatieLijst.filter((l) => stationIds.has(l.Locatie_MessageID)).map(
    (l) => ({ id: l.Code, name: l.Naam, lat: l.Lat, lng: l.Lon })
  );
}

/**
 * Many catalog stations are historical grab-sample points whose "latest" reading
 * is years old. Probe stations in batches and keep only those with a recent
 * surface-water temperature, so nearest-station links point at live sensors.
 */
export async function filterLiveStations(
  stations: RwsStation[],
  maxAgeDays = 7,
  log: (msg: string) => void = () => {}
): Promise<RwsStation[]> {
  const BATCH = 60;
  const cutoff = Date.now() - maxAgeDays * 24 * 3600 * 1000;
  const live = new Set<string>();
  for (let i = 0; i < stations.length; i += BATCH) {
    const batch = stations.slice(i, i + BATCH);
    const res = await fetch(
      `${BASE}/ONLINEWAARNEMINGENSERVICES/OphalenLaatsteWaarnemingen`,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          AquoPlusWaarnemingMetadataLijst: [
            {
              AquoMetadata: {
                Grootheid: { Code: "T" },
                Compartiment: { Code: "OW" },
              },
            },
          ],
          LocatieLijst: batch.map((s) => ({ Code: s.id })),
        }),
      }
    );
    if (!res.ok) continue;
    const json = (await res.json()) as LaatsteWaarnemingenResponse;
    for (const w of json.WaarnemingenLijst ?? []) {
      if (w.AquoMetadata.Grootheid?.Code !== "T") continue;
      for (const m of w.MetingenLijst ?? []) {
        const v = m.Meetwaarde?.Waarde_Numeriek;
        if (v == null || v > 100 || v < -10) continue;
        if (new Date(m.Tijdstip).getTime() >= cutoff) live.add(w.Locatie.Code);
      }
    }
    log(`  probed ${Math.min(i + BATCH, stations.length)}/${stations.length}, live so far: ${live.size}`);
  }
  return stations.filter((s) => live.has(s.id));
}

interface LaatsteWaarnemingenResponse {
  Succesvol: boolean;
  WaarnemingenLijst?: {
    Locatie: { Code: string; Naam: string };
    AquoMetadata: { Grootheid?: { Code: string }; Compartiment?: { Code: string } };
    MetingenLijst: {
      Tijdstip: string;
      Meetwaarde: { Waarde_Numeriek: number };
    }[];
  }[];
}

export interface LatestWaterTemp {
  stationId: string;
  stationName: string | null;
  temperatureC: number;
  measuredAt: string;
}

/**
 * Some catalog stations only measured historically; "latest" can be months old.
 * Older than this and we report no reading rather than a misleading one.
 */
const MAX_READING_AGE_MS = 72 * 60 * 60 * 1000;

/** Latest surface-water temperature reading at a station, or null when it has none. */
export async function fetchLatestWaterTemp(
  stationCode: string
): Promise<LatestWaterTemp | null> {
  const res = await fetch(
    `${BASE}/ONLINEWAARNEMINGENSERVICES/OphalenLaatsteWaarnemingen`,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        AquoPlusWaarnemingMetadataLijst: [
          { AquoMetadata: { Grootheid: { Code: "T" }, Compartiment: { Code: "OW" } } },
        ],
        LocatieLijst: [{ Code: stationCode }],
      }),
      // Sensor cadence is ~10 min but 30 min freshness is plenty for swimmers.
      next: { revalidate: 1800 },
    } as RequestInit
  );
  if (!res.ok) return null;
  const json = (await res.json()) as LaatsteWaarnemingenResponse;
  if (!json.Succesvol) return null;

  let best: LatestWaterTemp | null = null;
  for (const w of json.WaarnemingenLijst ?? []) {
    if (w.AquoMetadata.Grootheid?.Code !== "T") continue;
    for (const m of w.MetingenLijst ?? []) {
      const value = m.Meetwaarde?.Waarde_Numeriek;
      // RWS uses sentinel values like 999999999 for missing data
      if (value == null || value > 100 || value < -10) continue;
      if (Date.now() - new Date(m.Tijdstip).getTime() > MAX_READING_AGE_MS) continue;
      if (!best || m.Tijdstip > best.measuredAt) {
        best = {
          stationId: w.Locatie.Code,
          stationName: w.Locatie.Naam ?? null,
          temperatureC: value,
          measuredAt: m.Tijdstip,
        };
      }
    }
  }
  return best;
}
