import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchTimesForDate, rowToTimes } from "@/lib/prayerTimes";
import { getLocalTheme, LOCAL_THEMES, normalizeTheme } from "@/lib/theme";
import type { Layout, Theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

const WMO: Record<number, [string, string]> = {
  0: ["Clear", "☀️"], 1: ["Mostly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Cloudy", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Fog", "🌫️"], 51: ["Drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Drizzle", "🌦️"],
  61: ["Rain", "🌧️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"], 71: ["Snow", "🌨️"], 73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"], 80: ["Showers", "🌦️"], 81: ["Showers", "🌦️"], 82: ["Heavy showers", "🌧️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm", "⛈️"], 99: ["Thunderstorm", "⛈️"],
};

async function getWeather() {
  const lat = process.env.PRAYER_LAT ?? process.env.MASJID_LAT;
  const lon = process.env.PRAYER_LON ?? process.env.MASJID_LON;
  if (!lat || !lon) return null;
  const unit = process.env.TEMP_UNIT === "celsius" ? "celsius" : "fahrenheit";
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${unit}`,
      { next: { revalidate: 600 } }
    );
    const j = await r.json();
    const [label, icon] = WMO[j.current.weather_code] ?? ["", "🌡️"];
    return { temp: j.current.temperature_2m, unit: unit === "celsius" ? "C" : "F", label, icon };
  } catch { return null; }
}

/** Local theme JSON, or a custom theme saved in Supabase's `themes` table under the same name. */
async function resolveTheme(name: string): Promise<Theme> {
  if (LOCAL_THEMES[name]) return getLocalTheme(name);
  const { data } = await supabase.from("themes").select("json").eq("name", name).maybeSingle();
  return normalizeTheme((data?.json as Theme) ?? getLocalTheme(null));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const screenId = url.searchParams.get("screen");
  const themeParam = url.searchParams.get("theme");
  const layoutParam = url.searchParams.get("layout") as Layout | null;

  let themeName = themeParam ?? "default";
  let layout: Layout | null = layoutParam;
  let mode: "api" | "csv" = "api";
  let screenName: string | null = null;

  if (screenId) {
    const { data: screen } = await supabase.from("screens").select("*").eq("id", screenId).maybeSingle();
    if (screen) {
      themeName = themeParam ?? screen.theme;
      layout = layoutParam ?? (screen.layout as Layout);
      mode = screen.mode;
      screenName = screen.name;
    }
  } else if (!themeParam) {
    // Back-compat for the plain /display route (no screen id): the theme marked
    // `active` in Supabase's `themes` table, if any, otherwise the local default.
    const { data } = await supabase.from("themes").select("name").eq("active", true).limit(1).maybeSingle();
    themeName = data?.name ?? "default";
  }

  const todayISO = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const [timesRow, settings, ann, theme, weather] = await Promise.all([
    fetchTimesForDate(todayISO),
    supabase.from("iqamah_settings").select("*"),
    supabase.from("announcements").select("message").eq("active", true).order("id"),
    resolveTheme(themeName),
    getWeather(),
  ]);

  return NextResponse.json({
    times: rowToTimes(timesRow.data as any),
    settings: settings.data ?? [],
    announcements: (ann.data ?? []).map((a) => a.message),
    theme,
    weather,
    layout: layout ?? "horizontal",
    mode,
    screenName,
  });
}
