import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const token = await getStripe().terminal.connectionTokens.create();
    return NextResponse.json({ secret: token.secret });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to create connection token" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}
