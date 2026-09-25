import defaultTheme from "@/themes/default.json";
import modern from "@/themes/modern.json";
import geometric from "@/themes/geometric.json";
import haram from "@/themes/haram.json";
import nabawi from "@/themes/nabawi.json";
import aqsa from "@/themes/aqsa.json";

export type Layout = "horizontal" | "vertical";

/** Shown on every display (TV and mobile) so it never has to be typed twice. */
export const MASJID_NAME = "St. Clair Masjid and Islamic Education Center";

export interface Theme {
  name?: string;
  background: string;
  card: string;
  accent: string;
  text: string;
  mutedText?: string;
  border?: string;
  backgroundImage?: string;            // horizontal photo, e.g. /backgrounds/haram-horizontal.jpg
  backgroundImageVertical?: string;    // vertical photo (falls back to backgroundImage)
  backgroundPosition?: string;         // CSS background-position for horizontal
  backgroundPositionVertical?: string; // CSS background-position for vertical
  pattern?: string;                    // tiled PNG overlay
  gradient?: string;                   // CSS gradient, used when there is no photo
  glow?: string;
  fontHeading?: string;
  fontBody?: string;
}

export const LOCAL_THEMES: Record<string, Theme> = { default: defaultTheme, modern, geometric, haram, nabawi, aqsa };

export function getLocalTheme(key?: string | null): Theme {
  return (key && LOCAL_THEMES[key]) || LOCAL_THEMES.default;
}

export interface ThemeMeta { id: string; name: string; accent: string; background: string; thumbnail?: string }

/** Local themes, for the admin theme-picker thumbnails. Custom themes saved to Supabase's
 *  `themes` table are merged in separately by the page that fetches them. */
export function listLocalThemeMeta(): ThemeMeta[] {
  return Object.entries(LOCAL_THEMES).map(([id, t]) => ({
    id, name: t.name ?? id, accent: t.accent, background: t.background, thumbnail: t.backgroundImage || undefined,
  }));
}

/** Fill gaps so older/partial theme JSON (e.g. from the DB) still renders. */
export function normalizeTheme(raw: Theme & { muted?: string }): Theme {
  return {
    ...raw,
    mutedText: raw.mutedText ?? raw.muted ?? raw.text,
    border: raw.border ?? "transparent",
    glow: raw.glow ?? raw.accent,
    fontHeading: raw.fontHeading ?? "var(--font-heading)",
    fontBody: raw.fontBody ?? "var(--font-body)",
  };
}

const url = (p?: string) => (p ? `url("${p}")` : "none");

/** CSS variables that Tailwind's colors, shadows and backgrounds read from. */
export function themeToCssVars(t: Theme, layout: Layout = "horizontal"): Record<string, string> {
  const photo = layout === "vertical" ? t.backgroundImageVertical ?? t.backgroundImage : t.backgroundImage;
  return {
    "--bg": t.background,
    "--card": t.card,
    "--accent": t.accent,
    "--text": t.text,
    "--muted-text": t.mutedText ?? t.text,
    "--border": t.border ?? "transparent",
    "--glow": t.glow ?? t.accent,
    "--background-image": url(photo),
    "--pattern": url(t.pattern),
  };
}
