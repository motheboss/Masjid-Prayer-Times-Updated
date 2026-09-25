import { supabase } from "@/lib/supabase";
import type { PrayerTimes } from "@/lib/time";

export interface PrayerTimesRow {
  date: string; fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string; jumua: string | null;
}

export function rowToTimes(row: PrayerTimesRow | null): PrayerTimes | null {
  if (!row) return null;
  return { fajr: row.fajr, dhuhr: row.dhuhr, asr: row.asr, maghrib: row.maghrib, isha: row.isha, jumuah: row.jumua ?? "" };
}

/** Today's row if present, else the most recent earlier row (so a gap in a CSV upload doesn't blank the display). */
export async function fetchTimesForDate(dateISO: string) {
  const exact = await supabase.from("prayer_times").select("*").eq("date", dateISO).maybeSingle();
  if (exact.data) return exact;
  return supabase.from("prayer_times").select("*").lte("date", dateISO).order("date", { ascending: false }).limit(1).maybeSingle();
}

export interface CsvRow { date: string; fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string; jumua?: string }

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses `date,fajr,dhuhr,asr,maghrib,isha,jumua` CSV text. Header row is optional (auto-detected). */
export function parseCsv(text: string): { rows: CsvRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors: string[] = [];
  if (!lines.length) return { rows: [], errors: ["The file is empty."] };
  const cols = ["date", "fajr", "dhuhr", "asr", "maghrib", "isha", "jumua"];
  const first = lines[0].split(",").map((c) => c.trim().toLowerCase());
  const hasHeader = first[0] === "date";
  const body = hasHeader ? lines.slice(1) : lines;
  const rows: CsvRow[] = [];
  body.forEach((line, i) => {
    const parts = line.split(",").map((c) => c.trim());
    if (parts.length < 6) { errors.push(`Line ${i + 1}: expected at least 6 columns (date,fajr,dhuhr,asr,maghrib,isha[,jumua]).`); return; }
    const [date, fajr, dhuhr, asr, maghrib, isha, jumua] = parts;
    if (!DATE_RE.test(date)) { errors.push(`Line ${i + 1}: "${date}" is not a valid date (expected YYYY-MM-DD).`); return; }
    for (const [name, val] of [["fajr", fajr], ["dhuhr", dhuhr], ["asr", asr], ["maghrib", maghrib], ["isha", isha]] as const) {
      if (!TIME_RE.test(val)) errors.push(`Line ${i + 1}: ${name} "${val}" is not a valid HH:MM time.`);
    }
    if (jumua && !TIME_RE.test(jumua)) errors.push(`Line ${i + 1}: jumua "${jumua}" is not a valid HH:MM time.`);
    if (!errors.some((e) => e.startsWith(`Line ${i + 1}:`))) rows.push({ date, fajr, dhuhr, asr, maghrib, isha, jumua: jumua || undefined });
  });
  return { rows, errors };
}

export async function upsertCsvRows(rows: CsvRow[]) {
  return supabase.from("prayer_times").upsert(rows.map((r) => ({ ...r, jumua: r.jumua ?? null })), { onConflict: "date" });
}
