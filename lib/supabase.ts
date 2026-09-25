import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Both clients are created lazily, on first use, rather than at module load.
// Next.js's build step ("Collecting page data") imports every route file just
// to inspect it, even ones marked `force-dynamic` - so if a client were built
// at the top level of this file, a missing env var would crash the *entire*
// build the moment any route imported this module, not just requests that
// actually need Supabase. Lazy init means importing this file is always safe;
// only an actual call at request time can throw, and by then Cloudflare has
// the real runtime env vars available.

let _client: SupabaseClient | null = null;
export function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. " +
      "Set them in your deployment platform's environment variables (Production and Preview)."
    );
  }
  _client = createClient(url, key);
  return _client;
}

let _service: SupabaseClient | null = null;
export function getServiceClient(): SupabaseClient {
  if (_service) return _service;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase service client is not configured: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing. " +
      "Set them in your deployment platform's environment variables (server-only, never NEXT_PUBLIC_)."
    );
  }
  _service = createClient(url, key, { auth: { persistSession: false } });
  return _service;
}

// Back-compat: existing code across the app does `import { supabase } from "@/lib/supabase"`
// and calls it directly (e.g. `supabase.from(...)`). A Proxy forwards every property access
// to the lazily-created real client, so none of those call sites need to change.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
