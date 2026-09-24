import { getBillingProvider, isBillingEnabled } from "@/lib/billing/provider";
import { getSubscriptionInScope, parseScope } from "@/lib/billing/reconcile";
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
    // covered by their school can see the plan but not cancel it. Asked for
    // with scope "personal", it is their own Pro regardless — the nudge to
    // cancel it once the school pays uses that.
    const body = await req.json().catch(() => null);
    const scope = parseScope(body?.scope);
    const subscription = await getSubscriptionInScope(userId, scope);
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

    // A real provider's portal is already the right customer's. The simulated
    // one is a page of ours, which needs telling which subscription it is for.
    const portalUrl =
      scope === "personal" && url.startsWith("/billing/portal")
        ? `${url}&scope=personal`
        : url;

    return NextResponse.json({ url: portalUrl });
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
