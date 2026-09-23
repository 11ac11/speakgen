import { getBillingProvider, isBillingEnabled } from "@/lib/billing/provider";
import { getSubscriptionForViewer } from "@/lib/billing/reconcile";
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

    // Their own subscription, or their school's if they run it. A teacher
    // covered by their school can see the plan but not cancel it.
    const subscription = await getSubscriptionForViewer(userId);
    const customerId = subscription?.provider_customer_id ?? undefined;
    if (!subscription || !customerId) {
      return NextResponse.json(
        { error: "No subscription to manage" },
        { status: 404 }
      );
    }
    if (!subscription.can_manage) {
      return NextResponse.json(
        { error: "Your school's plan is managed by its owner or an admin." },
        { status: 403 }
      );
    }

    const { url } = await getBillingProvider().createPortalSession({
      providerCustomerId: customerId,
      returnUrl: `${new URL(req.url).origin}/settings`
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
