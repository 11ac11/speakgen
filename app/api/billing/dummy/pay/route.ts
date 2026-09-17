import { decodeIntent, signDummyBody } from "@/lib/billing/dummy";
import { getPrice } from "@/lib/billing/prices";
import { isBillingSimulated } from "@/lib/billing/provider";
import { getAuthenticatedUserId } from "@/lib/session";
import { processWebhook } from "@/lib/billing/webhook";
import { NextRequest, NextResponse } from "next/server";

/**
 * Stands in for the provider's servers. It builds the event a real provider
 * would send and posts it to the same webhook route, signed, so the whole path
 * that matters is exercised: verify, claim, reconcile.
 *
 * Deliberately not a shortcut that writes the plan directly. A shortcut would
 * test nothing.
 */
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

  const { intent } = (await req.json()) as { intent?: string };
  const decoded = intent ? decodeIntent(intent) : null;
  if (!decoded) {
    return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
  }

  // The intent is signed, but bind it to the session anyway: a token issued for
  // one account must not be redeemable by another.
  if (decoded.subject.kind !== "user" || decoded.subject.userId !== userId) {
    return NextResponse.json({ error: "Intent is not yours" }, { status: 403 });
  }

  const price = getPrice(decoded.plan, decoded.interval);
  const periodEnd = new Date();
  if (decoded.interval === "year") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const body = JSON.stringify({
    id: `dummy_evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: "subscription.updated",
    subscription: {
      provider: "stripe",
      providerCustomerId: `dummy_cus_${userId.slice(0, 8)}`,
      providerSubscriptionId: `dummy_sub_${userId.slice(0, 8)}_${decoded.plan}`,
      subject: decoded.subject,
      plan: decoded.plan,
      status: "active",
      interval: decoded.interval,
      seats: decoded.seats,
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false
    },
    amount: price.amount,
    currency: price.currency
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
    return NextResponse.json(
      { error: "Simulated payment failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ redirect: decoded.successUrl });
}
