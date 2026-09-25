"use client";
import { formatAmPm, formatTime } from "@/lib/time";

/** Blackout screen, active from iqamah until 15 minutes after.
 *  Only the clock and prayer name, on solid black, in the theme's accent color. */
export default function IqamahMode({ prayer, now }: { prayer: string; now: Date }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-[5vh] bg-black text-accent">
      <div className="font-heading text-[24vw] font-bold leading-none tabular-nums">
        {formatTime(now)}<span className="ml-[2vw] text-[6vw] font-medium">{formatAmPm(now)}</span>
      </div>
      <h1 className="font-heading text-[10vw] font-semibold leading-none">{prayer}</h1>
    </div>
  );
}
