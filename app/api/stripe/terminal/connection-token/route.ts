import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Called by the mobile app's StripeTerminalProvider tokenProvider (see mobile/app/App.tsx).
 *  This is the only place the Terminal SDK ever needs a Stripe secret, and it never leaves
 *  this server - the app only ever receives the short-lived connection token. */
export async function POST() {
  try {
    const token = await getStripe().terminal.connectionTokens.create();
    return NextResponse.json({ secret: token.secret });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
