import Stripe from "stripe";

// Lazy for the same reason as lib/supabase.ts: importing this file must never crash the
// build just because STRIPE_SECRET_KEY isn't set yet (e.g. a masjid not using donations).
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set. The donations feature is optional - set this to enable it.");
  _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  return _stripe;
}
