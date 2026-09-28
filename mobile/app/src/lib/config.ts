const raw = process.env.EXPO_PUBLIC_SITE_URL ?? "";
export const SITE_URL = raw.trim().replace(/\/+$/, "");

export function apiUrl(path: string): string {
  if (!SITE_URL) throw new Error("EXPO_PUBLIC_SITE_URL is not set. Add it to mobile/app/.env and rebuild.");
  if (!/^https?:\/\//i.test(SITE_URL)) throw new Error("EXPO_PUBLIC_SITE_URL must start with https://");
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
