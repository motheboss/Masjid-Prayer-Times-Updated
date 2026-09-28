import { createClient, SupabaseClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the Supabase Secret key (bypasses RLS). Import this only from route
// handlers / server code (e.g. app/api/**). Never import it from a client component.
// The env var has no NEXT_PUBLIC_ prefix, so Next.js will never ship it to the browser.

let _admin: SupabaseClient | null = null;
export function getAdminClient(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin client is not configured: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SECRET_KEY are missing. " +
      "Set them as server-only environment variables."
    );
  }
  _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _admin;
}
