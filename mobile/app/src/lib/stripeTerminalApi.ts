import { SITE_URL } from "./supabase";

/** Talks to the two server routes added under ../../app/api/stripe/terminal/ in the Next.js
 *  app (see that folder) - the Terminal SDK itself never touches your Stripe secret key, only
 *  these server-side calls do. */
export async function fetchConnectionToken(): Promise<string> {
  const res = await fetch(`${SITE_URL}/api/stripe/terminal/connection-token`, { method: "POST" });
  if (!res.ok) throw new Error("Could not fetch a Stripe Terminal connection token.");
  const json = await res.json();
  return json.secret;
}

export async function createDonationPaymentIntent(amountCents: number, masjidName: string): Promise<string> {
  const res = await fetch(`${SITE_URL}/api/stripe/terminal/payment-intent`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount_cents: amountCents, masjid_name: masjidName }),
  });
  if (!res.ok) throw new Error("Could not start the payment.");
  const json = await res.json();
  return json.client_secret;
}
