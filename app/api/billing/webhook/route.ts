import {
  getBillingProvider,
  getConfiguredProviderName,
  isBillingEnabled
} from "@/lib/billing/provider";
import {
  applySubscriptionState,
  claimEvent,
  releaseEvent
} from "@/lib/billing/reconcile";
import { NextRequest, NextResponse } from "next/server";

// The webhook is the only thing that may change a plan. A customer returning
// from a successful payment page proves nothing: they can navigate there
// directly, and the payment can still fail afterwards.
export async function POST(req: NextRequest) {
  const provider = getConfiguredProviderName();

  if (!provider || !isBillingEnabled()) {
    // 503 and not 404: the endpoint exists, billing is simply not turned on.
    return NextResponse.json(
      { error: "Billing is not available yet" },
      { status: 503 }
    );
  }

  // The raw body, not the parsed object: every provider signs the bytes.
  const rawBody = await req.text();

  let event;
  try {
    event = await getBillingProvider().parseWebhook({
      rawBody,
      headers: req.headers
    });
  } catch (error) {
    // A bad signature is not our problem to retry. 400 tells the provider the
    // delivery was rejected.
    console.error("Webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Claimed before acting, so a retry is a no-op rather than a second
    // subscription change.
    const isNew = await claimEvent(provider, event);
    if (!isNew) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.subscription) {
      await applySubscriptionState(event.subscription);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Hand the claim back before asking for a retry. Keeping it would make a
    // transient failure permanent: the provider would retry, the event would
    // look like a duplicate, and the subscription would never be applied.
    await releaseEvent(provider, event.id).catch(() => {});

    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
