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
    <div className={`flex flex-col gap-5 ${className}`}>

      {/* Header Row */}
      <div className="grid grid-cols-[1fr_12ch_12ch_1fr] px-10 text-4xl text-muted on-photo">
        <span>Prayer</span>
        <span className="text-center">Athan</span>
        <span className="text-center">Iqamah</span>
        <span className="text-right pr-6" dir="rtl">الصلاة</span>
      </div>

      {/* Daily Rows */}
      {schedule.map((p) => {
        const isNext = p.key === status.next.key;
        return (
          <div
            key={p.key}
            data-next={isNext || undefined}
            className={`grid grid-cols-[1fr_12ch_12ch_1fr] items-center rounded-2xl px-10 py-8 backdrop-blur-md transition-colors ${
              isNext
                ? "border border-accent/60 bg-accent/20 shadow-glow"
                : "border border-border/70 bg-card/45"
            }`}
          >

            {/* English Name */}
            <span className="font-heading text-6xl font-bold">{p.label}</span>

            {/* Athan */}
            <span className="w-[7ch] text-4xl text-muted text-center">
              {formatTime(p.athan)}
            </span>

            {/* Iqamah */}
            <span
              className={`w-[7ch] text-6xl font-extrabold text-center ${
                isNext ? "text-accent" : ""
              }`}
            >
              {formatTime(p.iqamah)}
            </span>

            {/* Arabic Name */}
            <span
              className="text-right pr-6 font-arabic text-6xl opacity-90"
              dir="rtl"
            >
              {p.arabic}
            </span>
          </div>
        );
      })}

      {/* Jumu'ah Row */}
      <div className="grid grid-cols-[1fr_12ch_12ch_1fr] items-center rounded-2xl border border-border/70 bg-card/30 px-10 py-8 backdrop-blur-md">

        <span className="font-heading text-6xl font-bold">Jumu&apos;ah</span>

        <span className="w-[7ch] text-4xl text-muted text-center">—</span>

        <span className="w-[7ch] text-6xl font-extrabold text-accent text-center">
          {formatTime(jumuahAsDate(jumuahTime, schedule[0].athan))}
        </span>

        <span
          className="text-right pr-6 font-arabic text-6xl opacity-90"
          dir="rtl"
        >
          الجمعة
        </span>
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
