import { ScheduleItem, Status, formatTime } from "@/lib/time";

/**
 * Bilingual, semi-transparent rows: English name pinned left, Arabic name pinned
 * right, Athan/Iqamah inset toward the middle (not stretched edge-to-edge) so the
 * theme background still shows through on both sides of the card. A translucent
 * accent tint (not a solid fill) marks the next prayer, so the glow never blocks
 * the photo behind it. Jumu'ah is a separate, always-present row with one fixed
 * time and no countdown/highlight.
 */
export default function PrayerList({
  schedule, status, jumuahTime, className = "",
}: { schedule: ScheduleItem[]; status: Status; jumuahTime: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="grid grid-cols-[1fr_auto_1fr] px-6 text-xl text-muted on-photo">
        <span>Prayer</span>
        <span className="flex gap-16 px-10 tabular-nums"><span>Athan</span><span>Iqamah</span></span>
        <span className="text-right" dir="rtl">الصلاة</span>
      </div>

      {schedule.map((p) => {
        const isNext = p.key === status.next.key;
        return (
          <div
            key={p.key}
            data-next={isNext || undefined}
            className={`grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl px-7 py-4 backdrop-blur-md transition-colors ${
              isNext ? "border border-accent/60 bg-accent/20 shadow-glow" : "border border-border/70 bg-card/45"
            }`}
          >
            <span className="font-heading text-3xl font-semibold">{p.label}</span>
            <span className="flex items-baseline gap-16 px-10 tabular-nums">
              <span className="w-[4.5ch] text-2xl text-muted">{formatTime(p.athan)}</span>
              <span className={`w-[4.5ch] text-4xl font-bold ${isNext ? "text-accent" : ""}`}>{formatTime(p.iqamah)}</span>
            </span>
            <span className="text-right font-arabic text-3xl opacity-90" dir="rtl">{p.arabic}</span>
          </div>
        );
      })}

      {/* Jumu'ah: shown every day as a quick reference, styled like the rows above but never highlighted. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-border/70 bg-card/30 px-7 py-4 backdrop-blur-md">
        <span className="font-heading text-3xl font-semibold">Jumu&apos;ah</span>
        <span className="flex items-baseline gap-16 px-10 tabular-nums">
          <span className="w-[4.5ch] text-2xl text-muted">—</span>
          <span className="w-[4.5ch] text-4xl font-bold text-accent">{formatTime(jumuahAsDate(jumuahTime, schedule[0].athan))}</span>
        </span>
        <span className="text-right font-arabic text-3xl opacity-90" dir="rtl">الجمعة</span>
      </div>
    </div>
  );
}

function jumuahAsDate(hhmm: string, sameDay: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(sameDay);
  d.setHours(h || 13, m || 10, 0, 0);
  return d;
}
