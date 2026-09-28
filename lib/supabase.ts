import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Browser-safe client: uses the Supabase *Publishable* key only. The Secret key lives in
// lib/supabaseAdmin.ts (server-only) and must never be imported from here or from any
// client component.
//
// Created lazily, on first use, rather than at module load: Next.js's build step
// ("Collecting page data") imports every route file just to inspect it, so a client built
// at the top level would crash the whole build when an env var is missing.

let _client: SupabaseClient | null = null;
export function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing. " +
      "Set them in your deployment platform's environment variables (Production and Preview)."
    );
  }
  _client = createClient(url, key);
  return _client;
}

// Back-compat: existing code does `import { supabase } from "@/lib/supabase"` and calls it
// directly (e.g. `supabase.from(...)`). A Proxy forwards every property access to the
// lazily-created real client, so no call site needs to change.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
