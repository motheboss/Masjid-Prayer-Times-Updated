import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getStatus, PrayerTimes, IqamahSetting, Status } from "./time";

interface Loaded { times: PrayerTimes; settings: IqamahSetting[]; status: Status }

/** Reads the same `prayer_times` (today's row) + `iqamah_settings` tables the web display
 *  reads, directly via Supabase (no round-trip through the Next.js app needed for this data -
 *  RLS already allows public reads, same as the TV displays). Polls every 60s, ticks every 1s. */
export function usePrayerData() {
  const [data, setData] = useState<Loaded | null>(null);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const todayISO = new Date().toLocaleDateString("en-CA");
        const [timesRes, settingsRes] = await Promise.all([
          supabase.from("prayer_times").select("*").lte("date", todayISO).order("date", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("iqamah_settings").select("*"),
        ]);
        if (!alive) return;
        if (timesRes.error || !timesRes.data) { setError("Prayer times are not available yet."); return; }
        const row = timesRes.data as any;
        const times: PrayerTimes = { fajr: row.fajr, dhuhr: row.dhuhr, asr: row.asr, maghrib: row.maghrib, isha: row.isha, jumuah: row.jumua ?? "" };
        setData({ times, settings: (settingsRes.data ?? []) as IqamahSetting[], status: getStatus(new Date(), times, (settingsRes.data ?? []) as IqamahSetting[]) });
        setError(null);
      } catch {
        setError("Could not load prayer times.");
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = data ? getStatus(now, data.times, data.settings) : null;
  return { times: data?.times ?? null, settings: data?.settings ?? [], status, now, error };
}
