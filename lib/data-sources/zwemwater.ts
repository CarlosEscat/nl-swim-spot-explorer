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
