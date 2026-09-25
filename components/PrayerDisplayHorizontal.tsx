"use client";
import AnnouncementsTicker from "./AnnouncementsTicker";
import PrayerList from "./PrayerList";
import CountdownCorner from "./CountdownCorner";
import { Clock, ViewProps, WeatherBadge } from "./DisplayHeader";
import { MASJID_NAME } from "@/lib/theme";

/** The photo fills the whole screen; the clock sits over it top-left, the prayer
 *  table floats as a translucent panel on the right, and the countdown lives in
 *  the bottom-left corner above the ticker - nothing is centered over the art. */
export default function PrayerDisplayHorizontal(p: ViewProps) {
  return (
    <div className="grid h-screen grid-rows-[1fr_auto] gap-6 p-10">
      <div className="grid min-h-0 grid-cols-[1.15fr_1fr] gap-10">
        <section className="flex min-h-0 flex-col justify-between">
          <header className="flex items-start justify-between on-photo">
            <div>
              <p className="font-heading text-xl font-semibold uppercase tracking-wide text-accent">{MASJID_NAME}</p>
              <p className="mt-2 text-4xl font-semibold">{p.gregorian}</p>
              <p className="mt-1 text-3xl text-accent">{p.hijri}</p>
            </div>
            <WeatherBadge weather={p.weather} />
          </header>

          <div className="on-photo">
            <Clock now={p.now} className="text-[9rem] leading-none" />
          </div>

          <CountdownCorner
            label={p.status.phase === "athan" ? "Next athan" : "Next iqamah"}
            name={p.status.next.label}
            ms={p.status.countdownMs}
          />
        </section>

        <aside className="ml-auto flex w-[36rem] max-w-full flex-col justify-center">
          <PrayerList schedule={p.schedule} status={p.status} jumuahTime={p.jumuahTime} />
        </aside>
      </div>

      <AnnouncementsTicker messages={p.announcements} />
    </div>
  );
}
