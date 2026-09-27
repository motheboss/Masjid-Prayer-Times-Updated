"use client";
import AnnouncementsTicker from "./AnnouncementsTicker";
import PrayerList from "./PrayerList";
import CountdownCorner from "./CountdownCorner";
import { Clock, ViewProps, WeatherBadge } from "./DisplayHeader";
import { MASJID_NAME } from "@/lib/theme";

export default function PrayerDisplayVertical(p: ViewProps) {
  return (
    <div className="grid h-screen grid-rows-[auto_auto_1fr_auto_auto] gap-10 p-10">

      {/* Header */}
      <header className="flex flex-col items-center gap-3 on-photo">
        <p className="font-heading text-3xl font-bold uppercase tracking-wide text-accent">
          {MASJID_NAME}
        </p>
        <p className="text-6xl font-bold">{p.gregorian}</p>
        <p className="text-5xl text-accent">{p.hijri}</p>
        <WeatherBadge weather={p.weather} />
      </header>

      {/* Clock */}
      <div className="flex justify-center">
        <Clock now={p.now} className="text-[14rem] leading-none on-photo" />
      </div>

      {/* Prayer Table */}
      <div className="flex justify-center">
        <div className="w-[90%] max-w-[70rem]">
          <PrayerList
            schedule={p.schedule}
            status={p.status}
            jumuahTime={p.jumuahTime}
          />
        </div>
      </div>

      {/* Countdown */}
      <div className="flex justify-center">
        <CountdownCorner
          label={p.status.phase === "athan" ? "Next athan" : "Next iqamah"}
          name={p.status.next.label}
          ms={p.status.countdownMs}
          side="left"
        />
      </div>

      {/* Ticker */}
      <AnnouncementsTicker messages={p.announcements} />
    </div>
  );
}
