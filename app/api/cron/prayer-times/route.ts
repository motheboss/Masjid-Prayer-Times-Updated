import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * Daily job (see vercel.json). Only runs the live Aladhan fetch when at least one
 * screen is set to API mode (`screens.mode = 'api'`) - a masjid using CSV upload
 * for every screen should not have its manually-entered times overwritten.
 * Jumu'ah is left untouched; set it on /admin/iqamah or via the CSV's `jumua` column.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: apiScreens } = await supabase.from("screens").select("id").eq("mode", "api").limit(1);
  if (!apiScreens?.length) return NextResponse.json({ skipped: true, reason: "no screen is set to API mode" });

  const lat = process.env.PRAYER_LAT ?? process.env.MASJID_LAT;
  const lon = process.env.PRAYER_LON ?? process.env.MASJID_LON;
  if (!lat || !lon) return NextResponse.json({ error: "PRAYER_LAT / PRAYER_LON not set" }, { status: 500 });

  const tz = process.env.PRAYER_TIMEZONE || "UTC";
  const now = new Date();
  const dateISO = now.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
  const [y, m, d] = dateISO.split("-");
  const method = process.env.PRAYER_CALC_METHOD ?? "2";
  const res = await fetch(`https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lon}&method=${method}`);
  if (!res.ok) return NextResponse.json({ error: "aladhan request failed" }, { status: 502 });
  const t = (await res.json()).data.timings;
  const hm = (s: string) => s.slice(0, 5);

  const row = { date: dateISO, fajr: hm(t.Fajr), dhuhr: hm(t.Dhuhr), asr: hm(t.Asr), maghrib: hm(t.Maghrib), isha: hm(t.Isha) };
  const { error } = await getAdminClient().from("prayer_times").upsert(row, { onConflict: "date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, row });
}
