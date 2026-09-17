import { signDummyBody } from "@/lib/billing/dummy";
import { isBillingSimulated } from "@/lib/billing/provider";
import { getSubscriptionForUser } from "@/lib/billing/reconcile";
import { getAuthenticatedUserId } from "@/lib/session";
import { processWebhook } from "@/lib/billing/webhook";
import { NextRequest, NextResponse } from "next/server";

/** The cancellation a provider's portal would report back. */
export async function POST(req: NextRequest) {
  if (!isBillingSimulated()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const current = await getSubscriptionForUser(userId);
  if (!current) {
    return NextResponse.json({ error: "Nothing to cancel" }, { status: 404 });
  }

  const body = JSON.stringify({
    id: `dummy_evt_${Date.now()}_cancel`,
    type: "subscription.canceled",
    subscription: {
      provider: "stripe",
      providerCustomerId: current.provider_customer_id,
      providerSubscriptionId: current.provider_subscription_id,
      subject: { kind: "user", userId },
      plan: current.plan,
      status: "canceled",
      interval: current.billing_interval,
      seats: current.seats,
      currentPeriodEnd: current.current_period_end,
      cancelAtPeriodEnd: true
    }
  });

  // Called directly rather than posted to our own URL: same verification, same
  // reconciliation, without the server making a request to itself while it is
  // already handling one.
  const webhook = await processWebhook({
    rawBody: body,
    headers: new Headers({
      "Content-Type": "application/json",
      "x-dummy-signature": signDummyBody(body)
    })
  });

  if (webhook.status !== 200) {
    return NextResponse.json({ error: "Cancel failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
