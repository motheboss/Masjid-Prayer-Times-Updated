"use client";
import type { CSSProperties, ReactNode } from "react";
import { Layout, Theme, getLocalTheme, normalizeTheme, themeToCssVars } from "@/lib/theme";

interface Props {
  theme?: Theme | null;       // theme JSON from Supabase
  themeName?: string | null;  // falls back to /themes/<themeName>.json
  layout?: Layout;            // picks the horizontal or vertical photo + scrim
  blackout?: boolean;         // solid black, no photo / pattern / glow
  children: ReactNode;
}

const M = (pct: number) => `color-mix(in srgb, var(--bg) ${pct}%, transparent)`;

/** Scrims keep the photo visible where there is no text and darken it behind the text. */
const SCRIM: Record<Layout, string> = {
  horizontal: [
    `linear-gradient(to bottom, ${M(55)} 0%, transparent 22%)`,
    `linear-gradient(to top, ${M(88)} 0%, transparent 40%)`,
    `linear-gradient(to right, transparent 0%, transparent 45%, ${M(70)} 72%, ${M(82)} 100%)`,
  ].join(","),
  vertical: [
    `linear-gradient(to bottom, ${M(55)} 0%, transparent 16%)`,
    `linear-gradient(to top, ${M(94)} 0%, ${M(84)} 46%, transparent 70%)`,
  ].join(","),
};

export default function ThemeLoader({ theme, themeName, layout = "horizontal", blackout, children }: Props) {
  const t = normalizeTheme(theme ?? getLocalTheme(themeName));

  if (blackout) {
    return <div style={themeToCssVars(t) as CSSProperties} className="min-h-screen w-full bg-black text-accent">{children}</div>;
  }

  const vertical = layout === "vertical";
  const position = (vertical ? t.backgroundPositionVertical : t.backgroundPosition) ?? "center";
  return (
    <div style={{ ...themeToCssVars(t, layout), fontFamily: t.fontBody } as CSSProperties} className="relative isolate min-h-screen w-full overflow-hidden bg-bg text-fg font-body">
      {t.backgroundImage ? (
        <>
          <div aria-hidden className="absolute inset-0 -z-40 bg-photo bg-cover bg-no-repeat" style={{ backgroundPosition: position }} />
          <div aria-hidden className="absolute inset-0 -z-30" style={{ background: SCRIM[layout] }} />
        </>
      ) : t.gradient ? (
        <div aria-hidden className="absolute inset-0 -z-40" style={{ background: t.gradient }} />
      ) : null}
      {t.pattern && <div aria-hidden className="absolute inset-0 -z-10 bg-pattern" style={{ backgroundSize: "256px 256px", opacity: 0.45 }} />}
      <div className="relative">{children}</div>
    </div>
  );
}
