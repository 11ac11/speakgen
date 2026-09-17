import { getBillingProvider, isBillingEnabled } from "@/lib/billing/provider";
import { getSubscriptionForUser } from "@/lib/billing/reconcile";
import { BillingNotConfiguredError } from "@/lib/billing/types";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Cancellations and card changes happen in the provider's own portal. Building
// our own would mean reimplementing proration, tax and dunning.
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isBillingEnabled()) {
      return NextResponse.json(
        { error: "Billing is not available yet" },
        { status: 503 }
      );
    }

    const subscription = await getSubscriptionForUser(userId);
    const customerId = subscription?.provider_customer_id as string | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "No subscription to manage" },
        { status: 404 }
      );
    }

    const { url } = await getBillingProvider().createPortalSession({
      providerCustomerId: customerId,
      returnUrl: `${new URL(req.url).origin}/dashboard`
    });

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof BillingNotConfiguredError) {
      return NextResponse.json(
        { error: "Billing is not available yet" },
        { status: 503 }
      );
    }
    console.error("Portal session failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
