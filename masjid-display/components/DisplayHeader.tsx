import { Weather, formatAmPm, formatTime } from "@/lib/time";

export interface ViewProps {
  schedule: import("@/lib/time").ScheduleItem[];
  status: import("@/lib/time").Status;
  now: Date;
  weather: Weather | null;
  hijri: string;
  gregorian: string;
  announcements: string[];
  jumuahTime: string;
}

export function Clock({ now, className = "" }: { now: Date; className?: string }) {
  return (
    <div className={`font-heading tabular-nums font-semibold ${className}`}>
      {formatTime(now)}<span className="ml-3 text-[0.35em] text-muted">{formatAmPm(now)}</span>
    </div>
  );
}

export function WeatherBadge({ weather }: { weather: Weather | null }) {
  if (!weather) return <div />;
  return (
    <div className="flex items-center gap-4 text-5xl tabular-nums">
      <span aria-hidden>{weather.icon}</span>
      <span>{Math.round(weather.temp)}°{weather.unit}</span>
      <span className="text-2xl text-muted">{weather.label}</span>
    </div>
  );
}
