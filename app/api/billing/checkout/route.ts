import { z } from "zod";
import { getBillingProvider, isBillingEnabled } from "@/lib/billing/provider";
import { getPrice } from "@/lib/billing/prices";
import { BillingNotConfiguredError } from "@/lib/billing/types";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "academy"]),
  interval: z.enum(["month", "year"]),
  seats: z.number().int().positive().max(200).optional()
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!isBillingEnabled()) {
      // 503 rather than 500: nothing is broken, billing is simply not turned on
      // yet. The provider decision is still open.
      return NextResponse.json(
        { error: "Billing is not available yet" },
        { status: 503 }
      );
    }

    const { plan, interval, seats } = parsed.data;
    const price = getPrice(plan, interval);
    if (!price.providerPriceId) {
      return NextResponse.json(
        { error: "That plan is not purchasable yet" },
        { status: 503 }
      );
    }

    const origin = new URL(req.url).origin;
    const { url } = await getBillingProvider().createCheckout({
      subject: { kind: "user", userId },
      plan,
      interval,
      seats,
      successUrl: `${origin}/dashboard?checkout=success`,
      cancelUrl: `${origin}/pricing?checkout=cancelled`
    });

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof BillingNotConfiguredError) {
      return NextResponse.json(
        { error: "Billing is not available yet" },
        { status: 503 }
      );
    }
    console.error("Checkout failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
