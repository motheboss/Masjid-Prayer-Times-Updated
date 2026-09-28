import { apiUrl } from "./config";

async function postJson(path: string, body?: unknown, timeoutMs = 15000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e: any) {
    throw new Error(e?.name === "AbortError" ? "Server timed out." : `Could not reach the server: ${e?.message ?? "network error"}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON (HTML error page) */ }

  if (!res.ok) throw new Error(json?.error ?? `Server error ${res.status}`);
  if (json === null) throw new Error("Server returned an invalid (non-JSON) response.");
  return json;
}

export async function fetchConnectionToken(): Promise<string> {
  const json = await postJson("/api/stripe/terminal/create-connection-token");
  if (typeof json.secret !== "string" || !json.secret) throw new Error("Server did not return a connection token.");
  return json.secret;
}

export async function createDonationPaymentIntent(amountCents: number, masjidName: string): Promise<string> {
  const json = await postJson("/api/stripe/terminal/payment-intent", { amount_cents: amountCents, masjid_name: masjidName });
  if (typeof json.client_secret !== "string" || !json.client_secret) throw new Error("Server did not return a payment client secret.");
  return json.client_secret;
}
