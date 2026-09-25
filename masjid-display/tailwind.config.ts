import type { Config } from "tailwindcss";

// Every color, shadow and background below resolves from CSS variables that
// ThemeLoader sets from the active theme JSON.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", fg: "var(--text)", accent: "var(--accent)", card: "var(--card)",
        muted: "var(--muted-text)", border: "var(--border)", glow: "var(--glow)",
      },
      boxShadow: {
        glow: "0 0 28px -4px var(--glow)",
        "glow-lg": "0 0 60px -6px var(--glow)",
      },
      dropShadow: { glow: "0 0 18px var(--glow)" },
      backgroundImage: { photo: "var(--background-image)", pattern: "var(--pattern)" },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
