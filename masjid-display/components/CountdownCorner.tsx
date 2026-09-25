import { formatCountdown } from "@/lib/time";

/** "Next athan/iqamah" countdown, pinned to a bottom corner instead of sitting mid-screen,
 *  so the theme photo stays the visual focus of the display. */
export default function CountdownCorner({
  label, name, ms, side = "left", className = "",
}: { label: string; name: string; ms: number; side?: "left" | "right"; className?: string }) {
  return (
    <div className={`inline-flex flex-col ${side === "right" ? "items-end text-right" : "items-start text-left"} on-photo ${className}`}>
      <p className="text-xl text-muted">{label}</p>
      <div className="flex items-baseline gap-4">
        <span className="font-heading text-3xl font-bold">{name}</span>
        <span className="font-heading text-4xl font-bold tabular-nums text-accent drop-shadow-glow">{formatCountdown(ms)}</span>
      </div>
    </div>
  );
}
