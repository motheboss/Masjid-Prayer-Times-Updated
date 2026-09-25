"use client";
import AnnouncementsTicker from "./AnnouncementsTicker";
import PrayerList from "./PrayerList";
import CountdownCorner from "./CountdownCorner";
import { Clock, ViewProps, WeatherBadge } from "./DisplayHeader";

/** Photo occupies the middle of the screen (see the empty spacer div); the clock
 *  sits at the top, the table floats as a right-inset panel below it, and the
 *  countdown is tucked in the bottom-left corner just above the ticker. */
export default function PrayerDisplayVertical(p: ViewProps) {
  return (
    <div className="flex h-screen flex-col gap-6 p-8">
      <header className="flex items-start justify-between on-photo">
        <div>
          <p className="text-3xl font-semibold">{p.gregorian}</p>
          <p className="mt-1 text-2xl text-accent">{p.hijri}</p>
        </div>
        <WeatherBadge weather={p.weather} />
      </header>

      <div className="flex min-h-[10rem] flex-1 items-start justify-center pt-4" aria-hidden>
        <Clock now={p.now} className="text-[7rem] leading-none on-photo" />
      </div>

      <div className="ml-auto w-[95%]">
        <PrayerList schedule={p.schedule} status={p.status} jumuahTime={p.jumuahTime} />
      </div>

      <CountdownCorner
        label={p.status.phase === "athan" ? "Next athan" : "Next iqamah"}
        name={p.status.next.label}
        ms={p.status.countdownMs}
      />

      <AnnouncementsTicker messages={p.announcements} />
    </div>
  );
}
