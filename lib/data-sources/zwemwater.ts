import ExcelJS from "exceljs";
import type { QualityStatus } from "@/lib/types";

const DATA_PAGE = "https://www.zwemwater.nl/data-en-api/";

/** One advisory row from the monthly zwemwater.nl "gepubliceerde maatregelen" XLSX. */
export interface ZwemwaterAdvisory {
  spotName: string;
  status: string; // raw: WAARSCHUWING | NEGATIEF_ZWEMADVIES | ZWEMVERBOD | NADER_ONDERZOEK
  reason: string | null;
  startDate: string; // ISO date
  endDate: string | null; // null = still active
}

/**
 * The XLSX filename changes monthly (…/uploads/YYYY/MM/Aantal-gepubliceerde-maatregelen-<maand>.xlsx),
 * so scrape the data page for the current link.
 */
export async function resolveCurrentXlsxUrl(): Promise<string> {
  const res = await fetch(DATA_PAGE, {
    headers: { "User-Agent": "nl-swim-spot-explorer/1.0" },
  });
  if (!res.ok) throw new Error(`zwemwater.nl data page failed: ${res.status}`);
  const html = await res.text();
  const match = html.match(/https?:\/\/[^"'\s]+\.xlsx/i);
  if (!match) throw new Error("No .xlsx link found on zwemwater.nl data page");
  return match[0];
}

export async function fetchAdvisories(
  xlsxUrl?: string
): Promise<ZwemwaterAdvisory[]> {
  const url = xlsxUrl ?? (await resolveCurrentXlsxUrl());
  const res = await fetch(url, {
    headers: { "User-Agent": "nl-swim-spot-explorer/1.0" },
  });
  if (!res.ok) throw new Error(`zwemwater.nl XLSX download failed: ${res.status}`);
  const buffer = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  // exceljs's Buffer typing predates Node's generic Buffer types; runtime accepts an ArrayBuffer fine.
  await wb.xlsx.load(buffer as never);
  const ws = wb.worksheets[0];
  const advisories: ZwemwaterAdvisory[] = [];
  ws.eachRow((row, n) => {
    if (n === 1) return; // header: zwemplek, zwemwaterlocatie, status, toelichting_standaard, begindatum, begin_jaar, einddatum, gebied
    const v = row.values as (string | Date | number | null | undefined)[];
    const spotName = String(v[1] ?? "").trim();
    const status = String(v[3] ?? "").trim();
    const start = toIsoDate(v[5]);
    if (!spotName || !status || !start) return;
    advisories.push({
      spotName,
      status,
      reason: v[4] ? String(v[4]) : null,
      startDate: start,
      endDate: toIsoDate(v[7]),
    });
  });
  return advisories;
}

function toIsoDate(v: unknown): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** One entry from zwemwater.nl's server-rendered location list. */
export interface ZwemwaterLocation {
  id: string;
  name: string;
}

/**
 * All ~950 locations from the zwemwater.nl homepage. Each card renders as
 * `<h3 class="h5">NAME</h3> … data-spotid="NNNNN"`, so pair them up in
 * document order.
 */
export async function fetchLocationList(): Promise<ZwemwaterLocation[]> {
  const res = await fetch("https://www.zwemwater.nl/", {
    headers: { "User-Agent": "nl-swim-spot-explorer/1.0" },
  });
  if (!res.ok) throw new Error(`zwemwater.nl homepage failed: ${res.status}`);
  const html = await res.text();

  const locations: ZwemwaterLocation[] = [];
  // The no-other-h3 guard keeps stray page headings from pairing with the
  // first card's spotid.
  const card =
    /<h3 class="h5">([^<]+)<\/h3>(?:(?!<h3)[\s\S])*?data-spotid="(\d+)"/g;
  for (const m of html.matchAll(card)) {
    locations.push({ id: m[2], name: decodeEntities(m[1].trim()) });
  }
  if (locations.length < 100) {
    throw new Error(
      `zwemwater.nl location list looks broken: only ${locations.length} entries parsed`
    );
  }
  return locations;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&#8217;|&rsquo;/g, "'")
    .replace(/&#8216;|&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** One measured value from the zwemwater.nl per-location "Meetgegevens" tab. */
export interface ZwemwaterMeasurement {
  /** Sample date (ISO, date part of the lab's reported time). */
  date: string;
  /** cfu/100 ml; 15 is the lab's detection limit ("<15", best result). */
  value: number;
}

export interface ZwemwaterMeasurements {
  e_coli: ZwemwaterMeasurement[];
  enterococci: ZwemwaterMeasurement[];
}

/**
 * Current-season bacteriological measurements for one location, parsed from
 * the JSON blob zwemwater.nl embeds in its detail overlay (the same data
 * behind their "Meetgegevens" charts). Returns null when the location has no
 * measurement data.
 */
export async function fetchMeasurements(
  zwemwaterId: string
): Promise<ZwemwaterMeasurements | null> {
  const url = `https://www.zwemwater.nl/wp-content/themes/stuurlui/blocks/map/map-content.php?spotid=${encodeURIComponent(zwemwaterId)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "nl-swim-spot-explorer/1.0" },
  });
  if (!res.ok) throw new Error(`zwemwater.nl map-content failed: ${res.status}`);
  const html = await res.text();

  const m = html.match(/value='([^']*)'\s+id="monitoring-data"/);
  if (!m || !m[1]) return null;

  let raw: Record<string, Record<string, [number, string]>>;
  try {
    raw = JSON.parse(m[1]);
  } catch {
    return null;
  }

  const toSeries = (
    series: Record<string, [number, string]> | undefined
  ): ZwemwaterMeasurement[] =>
    Object.values(series ?? {})
      .filter(([value, at]) => typeof value === "number" && at)
      .map(([value, at]) => ({ date: String(at).slice(0, 10), value }))
      .sort((a, b) => a.date.localeCompare(b.date));

  const e_coli = toSeries(raw.E_COLI);
  const enterococci = toSeries(raw.INTTNLETRCCN);
  if (e_coli.length === 0 && enterococci.length === 0) return null;
  return { e_coli, enterococci };
}

/** Map a raw zwemwater.nl measure status onto our quality scale. */
export function mapAdvisoryStatus(raw: string): QualityStatus {
  switch (raw) {
    case "ZWEMVERBOD":
      return "banned";
    case "NEGATIEF_ZWEMADVIES":
      return "negative_advice";
    case "WAARSCHUWING":
    case "NADER_ONDERZOEK":
      return "warning";
    default:
      return "warning";
  }
}

/** Rank for picking the worst of multiple simultaneously-active advisories. */
export function statusSeverity(s: QualityStatus): number {
  return ["good", "acceptable", "warning", "negative_advice", "banned"].indexOf(s);
}
