"use client";
import { useEffect, useMemo, useState } from "react";
import ThemeLoader from "@/components/ThemeLoader";
import { MASJID_NAME } from "@/lib/theme";
import type { Theme } from "@/lib/theme";
import {
  IqamahSetting, PrayerTimes, Weather,
  buildDisplaySchedule, resolveJumuahTime, getStatus,
  hijriDate, gregorianDate, formatTime, formatAmPm, formatCountdown,
} from "@/lib/time";

interface DisplayData {
  times: PrayerTimes | null;
  settings: IqamahSetting[];
  announcements: string[];
  weather: Weather | null;
  theme: Theme | null;
}

/**
 * Dedicated mobile homepage - a plain scrolling phone page, built from scratch
 * and independent of DisplayClient.tsx/PrayerDisplayHorizontal/Vertical. It does
 * NOT run the TV screen-scaling logic (no `document.documentElement.style.fontSize`
 * trick, no h-screen/grid TV layout) - everything here sizes with normal Tailwind
 * classes and the page scrolls like any other website.
 *
 * Theming is still reused, not reinvented: this page wraps its content in the
 * same <ThemeLoader> the TV displays use, with layout="vertical" (a phone is
 * always portrait), so whichever theme is active in /api/display - photo,
 * gradient, pattern, accent color, fonts - applies here automatically. Only the
 * *sizing and structure* are mobile-specific: a single column, larger tap-sized
 * cards, and a clock/prayer-box scale chosen for a phone held at arm's length
 * rather than a TV across a room.
 *
 * Polls /api/display every 60s and ticks its own clock every second, same
 * refresh pattern as the TV displays.
 */
export default function MobileHome() {
  const [data, setData] = useState<DisplayData | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/display", { cache: "no-store" });
        if (!alive || !r.ok) return;
        setData(await r.json());
      } catch { /* keep showing the last good data */ }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const view = useMemo(() => {
    if (!data?.times || !now) return null;
    return {
      schedule: buildDisplaySchedule(data.times, data.settings, now),
      status: getStatus(now, data.times, data.settings),
      jumuah: resolveJumuahTime(data.times, data.settings),
    };
  }, [data, now]);

  if (!now || !view || !data) {
    return (
      <ThemeLoader themeName="default" layout="vertical">
        <p className="on-photo px-6 py-16 text-center text-lg text-muted">Loading prayer times…</p>
      </ThemeLoader>
    );
  }

  return (
    <ThemeLoader theme={data.theme} layout="vertical">
      <main className="mx-auto min-h-screen max-w-md pb-12">
        {/* Masjid name + header */}
        <header className="px-6 pb-6 pt-10 text-center on-photo">
          <h1 className="font-heading text-lg font-semibold uppercase tracking-wide text-accent">
            {MASJID_NAME}
          </h1>
          <p className="mt-3 text-base font-medium">{gregorianDate(now)}</p>
          <p className="mt-1 text-base text-accent">{hijriDate(now)}</p>
          {data.weather && (
            <p className="mt-3 flex items-center justify-center gap-2 text-2xl">
              <span aria-hidden>{data.weather.icon}</span>
              <span className="font-semibold">{Math.round(data.weather.temp)}°{data.weather.unit}</span>
              <span className="text-base text-muted">{data.weather.label}</span>
            </p>
          )}
        </header>

        <div className="flex flex-col gap-6 px-5">
          {/* Readable clock */}
          <section className="rounded-3xl border border-border/50 bg-card/70 p-6 text-center shadow-sm backdrop-blur-md">
            <p className="font-heading text-6xl font-bold leading-none tabular-nums">
              {formatTime(now)}
              <span className="ml-2 align-top text-xl font-semibold text-muted">{formatAmPm(now)}</span>
            </p>
            <div className="mt-4 border-t border-border/40 pt-4">
              <p className="text-sm uppercase tracking-wide text-muted">
                {view.status.phase === "athan" ? "Next athan" : "Next iqamah"} · {view.status.next.label}
              </p>
              <p className="mt-1 font-heading text-4xl font-bold tabular-nums text-accent drop-shadow-glow">
                {formatCountdown(view.status.countdownMs)}
              </p>
            </div>
          </section>

          {/* Salah times - larger, well-padded, readable from a distance */}
          <section>
            <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
              Today&apos;s prayer times
            </h2>
            <div className="flex flex-col gap-4">
              {view.schedule.map((p) => {
                const isNext = p.key === view.status.next.key;
                return (
                  <div
                    key={p.key}
                    className={`flex items-center justify-between rounded-3xl border p-6 shadow-sm backdrop-blur-md transition-colors ${
                      isNext ? "border-accent/60 bg-accent/20 shadow-glow" : "border-border/50 bg-card/70"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-heading text-2xl font-semibold">{p.label}</span>
                      <span className="font-arabic text-xl opacity-80" dir="rtl">{p.arabic}</span>
                    </div>
                    <div className="flex flex-col items-end tabular-nums">
                      <span className="text-base text-muted">Athan {formatTime(p.athan)}</span>
                      <span className={`text-3xl font-bold ${isNext ? "text-accent" : ""}`}>
                        {formatTime(p.iqamah)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Jumu'ah - fixed time, styled the same, no countdown/highlight */}
              <div className="flex items-center justify-between rounded-3xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="font-heading text-2xl font-semibold">Jumu&apos;ah</span>
                  <span className="font-arabic text-xl opacity-80" dir="rtl">الجمعة</span>
                </div>
                <span className="text-3xl font-bold tabular-nums">{formatTime(parseHHMM(view.jumuah, now))}</span>
              </div>
            </div>
          </section>

          {/* Announcements */}
          {data.announcements.length > 0 && (
            <section>
              <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
                Announcements
              </h2>
              <div className="flex flex-col gap-3">
                {data.announcements.map((msg, i) => (
                  <p
                    key={i}
                    className="rounded-2xl border border-border/50 bg-card/60 p-4 text-base leading-relaxed backdrop-blur-md"
                  >
                    {msg}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </ThemeLoader>
  );
}

function parseHHMM(hhmm: string, base: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}
