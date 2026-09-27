export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "jumuah";
export type IqamahMode = "dynamic" | "static";

export interface PrayerTimes { fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string; jumuah: string }
export interface IqamahSetting { prayer_name: string; offset_minutes: number; fixed_time: string | null; mode: IqamahMode }
export interface Weather { temp: number; unit: "F" | "C"; label: string; icon: string }

export interface ScheduleItem {
  key: PrayerKey; label: string; arabic: string;
  athan: Date; iqamah: Date; mode: IqamahMode;
}
export interface Status {
  next: ScheduleItem;
  phase: "athan" | "iqamah";   // which event the countdown is counting toward
  countdownMs: number;
  msToIqamah: number;
  blackout: boolean;                    // true from iqamah until 15 minutes after
  blackoutPrayer: ScheduleItem | null;  // the prayer whose iqamah just started
}

export const BLACKOUT_MINUTES = 15;
const MIN = 60_000;

const META: Record<PrayerKey, [string, string]> = {
  fajr: ["Fajr", "الفجر"], dhuhr: ["Dhuhr", "الظهر"], asr: ["Asr", "العصر"],
  maghrib: ["Maghrib", "المغرب"], isha: ["Isha", "العشاء"], jumuah: ["Jumu'ah", "الجمعة"],
};

/** "HH:MM" or "HH:MM:SS" -> Date on the same day as `base`. */
export function parseTime(hhmm: string, base: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * dynamic -> athan + offset, static -> fixed_time.
 * Note: "static" with no fixed_time saved falls back to athan + offset rather than
 * erroring, so a misconfigured row still shows *something* on the display. The admin
 * panel blocks saving static mode without a fixed time so this fallback shouldn't be
 * hit in practice - if you see iqamah landing right at (or just after) athan
 * unexpectedly, check that prayer's row in /admin/iqamah.
 */
export function calcIqamah(athan: Date, s: IqamahSetting | undefined, base: Date): Date {
  if (!s) return new Date(athan.getTime() + 10 * MIN);
  if (s.mode === "static" && s.fixed_time) return parseTime(s.fixed_time, base);
  return new Date(athan.getTime() + s.offset_minutes * MIN);
}

/**
 * The five prayers for `day`, always as Fajr/Dhuhr/Asr/Maghrib/Isha (never
 * swapped for Jumu'ah). Used for the *display table* only - Jumu'ah is shown
 * as its own fixed row underneath instead. `buildSchedule` below is still the
 * one used for the countdown/blackout status, since that needs the Friday
 * swap to trigger blackout at the Jumu'ah iqamah rather than a mid-day Dhuhr.
 */
export function buildDisplaySchedule(times: PrayerTimes, settings: IqamahSetting[], day: Date): ScheduleItem[] {
  const byName = Object.fromEntries(settings.map((s) => [s.prayer_name, s]));
  const keys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  return keys.map((key) => {
    const athan = parseTime(times[key], day);
    const setting = byName[key];
    return { key, label: META[key][0], arabic: META[key][1], athan, iqamah: calcIqamah(athan, setting, day), mode: setting?.mode ?? "dynamic" };
  });
}

/**
 * Jumu'ah's fixed display time: the per-date CSV value if present, else the
 * static time set on /admin/iqamah, else 1:10 PM.
 *
 * Uses `||` rather than `??` on purpose at both steps: a CSV upload with an
 * empty `jumua` cell (or a DB row where that column is an empty string rather
 * than null) is falsy but not strictly `null`/`undefined`, so `??` would let
 * "" through and `resolveJumuahTime` would return "" instead of falling back -
 * which is what was reaching <PrayerDisplayVertical>/<PrayerDisplayHorizontal>
 * as `jumuahTime` and tripping the ViewProps type ("" widened to `string | null`
 * upstream). `||` treats "" the same as missing, so this always returns a
 * genuine, non-empty string.
 */
export function resolveJumuahTime(times: PrayerTimes, settings: IqamahSetting[]): string {
  const csv = times.jumuah;
  if (csv) return csv;
  const fixed = settings.find((x) => x.prayer_name === "jumuah")?.fixed_time;
  return fixed || "13:10";
}

/** Five daily prayers for `day`. On Fridays Dhuhr is replaced by Jumu'ah. */
export function buildSchedule(times: PrayerTimes, settings: IqamahSetting[], day: Date): ScheduleItem[] {
  const byName = Object.fromEntries(settings.map((s) => [s.prayer_name, s]));
  const friday = day.getDay() === 5;
  const keys: PrayerKey[] = ["fajr", friday ? "jumuah" : "dhuhr", "asr", "maghrib", "isha"];
  return keys.map((key) => {
    const athan = parseTime(times[key], day);
    const setting = byName[key] ?? (key === "jumuah" ? byName["dhuhr"] : undefined);
    return {
      key, label: META[key][0], arabic: META[key][1], athan,
      iqamah: calcIqamah(athan, setting, day),
      mode: setting?.mode ?? "dynamic",
    };
  });
}

export function getStatus(now: Date, times: PrayerTimes, settings: IqamahSetting[]): Status {
  const today = buildSchedule(times, settings, now);
  let next = today.find((p) => p.iqamah > now);
  if (!next) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * MIN);
    next = buildSchedule(times, settings, tomorrow)[0];
  }
  const msToIqamah = next.iqamah.getTime() - now.getTime();
  const phase = now < next.athan ? "athan" : "iqamah";
  const target = phase === "athan" ? next.athan : next.iqamah;

  // Blackout: exactly at iqamah, for 15 minutes after. Applies to every prayer
  // (static or dynamic). Yesterday is included so an iqamah just before midnight still works.
  const yesterday = new Date(now.getTime() - 24 * 60 * MIN);
  const blackoutPrayer =
    [...buildSchedule(times, settings, yesterday), ...today].find((p) => isBlackoutActive(now, p.iqamah)) ?? null;

  return {
    next, phase, msToIqamah, blackoutPrayer,
    countdownMs: target.getTime() - now.getTime(),
    blackout: blackoutPrayer !== null,
  };
}

export function isBlackoutActive(now: Date, iqamahTime: Date): boolean {
  return now >= iqamahTime && now.getTime() <= iqamahTime.getTime() + BLACKOUT_MINUTES * MIN;
}

/** Automatic iqamah announcements. Only dynamic-mode prayers trigger them. */
export function autoAnnouncements(schedule: ScheduleItem[], now: Date): string[] {
  return schedule
    .filter((p) => p.mode === "dynamic" && p.iqamah > now)
    .map((p) => `${p.label} iqamah at ${formatTime(p.iqamah)}`);
}

export function formatTime(d: Date): string {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export function formatAmPm(d: Date): string { return d.getHours() >= 12 ? "PM" : "AM"; }

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = String(m).padStart(2, "0"), ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function hijriDate(d: Date): string {
  return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d);
}
export function gregorianDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(d);
}
