"use client";
import { useEffect, useMemo, useState } from "react";
import ThemeLoader from "@/components/ThemeLoader";
import PrayerDisplayHorizontal from "@/components/PrayerDisplayHorizontal";
import PrayerDisplayVertical from "@/components/PrayerDisplayVertical";
import IqamahMode from "@/components/IqamahMode";
import {
  IqamahSetting, PrayerTimes, Weather, autoAnnouncements, buildDisplaySchedule, buildSchedule,
  getStatus, gregorianDate, hijriDate, resolveJumuahTime,
} from "@/lib/time";
import type { Layout, Theme } from "@/lib/theme";

interface Data {
  times: PrayerTimes | null; settings: IqamahSetting[]; announcements: string[];
  theme: Theme | null; weather: Weather | null; layout: Layout; mode: "api" | "csv"; screenName: string | null;
}

// Absolute last line of defense: whatever resolveJumuahTime (or a bad DB row) hands back,
// this always produces a real, non-empty string.
function safeJumuahTime(times: PrayerTimes | null, settings: IqamahSetting[]): string {
  if (!times) return "13:10";
  const resolved = resolveJumuahTime(times, settings);
  return resolved || "13:10";
}

/** TV/kiosk display only. For phones, use /mobile instead - it has its own
 *  layout and does not run this component's screen-scaling logic at all. */
export default function DisplayClient({ apiUrl, layoutOverride }: { apiUrl: string; layoutOverride?: Layout | null }) {
  const [data, setData] = useState<Data | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [layout, setLayout] = useState<Layout>("horizontal");

  // Scale everything to the screen: 1920x1080 basis for horizontal, 1080x1920 for vertical.
  useEffect(() => {
    const fit = () => {
      const k = layout === "vertical" ? window.innerWidth / 1080 : Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      document.documentElement.style.fontSize = `${16 * k}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => { window.removeEventListener("resize", fit); document.documentElement.style.fontSize = ""; };
  }, [layout]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(apiUrl, { cache: "no-store" });
        if (!alive || !r.ok) return;
        const json: Data = await r.json();
        setData(json);
        setLayout(layoutOverride ?? json.layout ?? (window.innerHeight > window.innerWidth ? "vertical" : "horizontal"));
      } catch { /* keep showing last good data */ }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [apiUrl, layoutOverride]);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const view = useMemo(() => {
    if (!data?.times || !now) return null;
    return {
      schedule: buildDisplaySchedule(data.times, data.settings, now),
      statusSchedule: buildSchedule(data.times, data.settings, now),
      status: getStatus(now, data.times, data.settings),
    };
  }, [data, now]);

  if (!now || !view || !data) {
    return <ThemeLoader themeName="default" layout={layout}><p className="p-10 text-4xl">Loading prayer times…</p></ThemeLoader>;
  }

  if (view.status.blackoutPrayer) {
    return (
      <ThemeLoader theme={data.theme} blackout>
        <IqamahMode prayer={view.status.blackoutPrayer.label} now={now} />
      </ThemeLoader>
    );
  }

  const jumuahTime: string = safeJumuahTime(data.times, data.settings);

  const props = {
    schedule: view.schedule, status: view.status, now, weather: data.weather,
    hijri: hijriDate(now), gregorian: gregorianDate(now),
    jumuahTime,
    announcements: [...data.announcements, ...autoAnnouncements(view.statusSchedule, now)],
  };

  return (
    <ThemeLoader theme={data.theme} layout={layout}>
      {layout === "vertical" ? <PrayerDisplayVertical {...props} /> : <PrayerDisplayHorizontal {...props} />}
    </ThemeLoader>
  );
}
