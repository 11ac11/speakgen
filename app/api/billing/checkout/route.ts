import { z } from "zod";
import {
  getBillingProvider,
  isBillingEnabled,
  isBillingSimulated
} from "@/lib/billing/provider";
import { getPrice } from "@/lib/billing/prices";
import {
  BillingNotConfiguredError,
  type BillingSubject
} from "@/lib/billing/types";
import { ENTITLEMENTS } from "@/lib/entitlements";
import { getUserOrganizations } from "@/lib/organizations";
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

    // A real provider needs its own id for the price; the simulated one prices
    // from the catalogue directly and has nothing to look up.
    const price = getPrice(plan, interval);
    if (!isBillingSimulated() && !price.providerPriceId) {
      return NextResponse.json(
        { error: "That plan is not purchasable yet" },
        { status: 503 }
      );
    }

    /* Pro is the teacher's own. Academy is the school's: it covers every
       member, so it has to be bought by someone who runs the school, and a
       teacher with no school has to make one first — the pricing card offers
       to, on the "no_school" answer below. */
    let subject: BillingSubject = { kind: "user", userId };
    let seatCount = seats;

    if (plan === "academy") {
      const schools = await getUserOrganizations(userId);
      const runs = schools.filter((school) =>
        ["owner", "admin"].includes(school.role)
      );

      if (schools.length === 0) {
        return NextResponse.json(
          { error: "Create your school first", reason: "no_school" },
          { status: 409 }
        );
      }
      if (runs.length === 0) {
        return NextResponse.json(
          {
            error:
              "Only your school's owner or an admin can buy Academy for it.",
            reason: "not_admin"
          },
          { status: 403 }
        );
      }

      subject = { kind: "organization", organizationId: runs[0].id };
      // The plan's own seat count. Extra seats beyond it are a later change.
      seatCount = ENTITLEMENTS.academy.seats;
    }

    const origin = new URL(req.url).origin;
    const { url } = await getBillingProvider().createCheckout({
      subject,
      plan,
      interval,
      seats: seatCount,
      successUrl: `${origin}/settings?checkout=success`,
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
