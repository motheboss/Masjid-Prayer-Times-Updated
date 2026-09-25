"use client";

export default function AnnouncementsTicker({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  const text = messages.join("      •      ");
  const seconds = Math.max(25, Math.round(text.length * 0.22));
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card py-4 backdrop-blur-md" aria-live="polite">
      <div className="ticker-track text-3xl" style={{ animationDuration: `${seconds}s` }}>
        <span className="px-8">{text}</span>
        <span className="px-8" aria-hidden>{text}</span>
      </div>
    </div>
  );
}
