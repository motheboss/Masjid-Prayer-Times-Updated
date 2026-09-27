import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Creates a card_present PaymentIntent for one donation tap. The mobile app calls this,
 *  then passes the returned client_secret straight into the Terminal SDK's
 *  retrievePaymentIntent -> collectPaymentMethod -> confirmPaymentIntent flow -
 *  see mobile/app/src/screens/DonationsScreen.tsx. */
export async function POST(req: Request) {
  const { amount_cents, masjid_name } = await req.json();
  if (!amount_cents || amount_cents < 100) {
    return NextResponse.json({ error: "amount_cents (>= 100) is required" }, { status: 400 });
  }
  try {
    const intent = await getStripe().paymentIntents.create({
      amount: Math.round(amount_cents),
      currency: "usd",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      description: `Donation to ${masjid_name ?? "the masjid"} (in-person, Stripe Terminal)`,
    });
    return NextResponse.json({ client_secret: intent.client_secret });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
