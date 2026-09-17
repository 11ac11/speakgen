import { processWebhook } from "@/lib/billing/webhook";
import { NextRequest, NextResponse } from "next/server";

// The webhook is the only thing that may change a plan. A customer returning
// from a successful payment page proves nothing: they can navigate there
// directly, and the payment can still fail afterwards.
export async function POST(req: NextRequest) {
  // The raw body, not the parsed object: every provider signs the bytes.
  const rawBody = await req.text();

  const result = await processWebhook({ rawBody, headers: req.headers });
  return NextResponse.json(result.body, { status: result.status });
}
