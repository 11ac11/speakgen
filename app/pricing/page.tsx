import { Lead } from "@/app/components/Lead";
import {
  PLANS,
  ENTITLEMENTS,
  type Entitlements,
  type Plan
} from "@/lib/entitlements";
import {
  Actions,
  Blurb,
  Card,
  CurrentBadge,
  Cross,
  Feature,
  Features,
  PlanGrid,
  PlanName,
  Price,
  Tick,
  Yearly
} from "./PlanCard";
import { formatPrice, getPrice } from "@/lib/billing/prices";
import { isBillingEnabled, isBillingSimulated } from "@/lib/billing/provider";
import { getAuthenticatedUserId } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import PlanActions from "./PlanActions";

export const metadata = { title: "Plans — Speakgen" };

const BLURBS: Record<string, string> = {
  free: "Everything you need to try it with a class.",
  pro: "For a teacher running their own classes.",
  academy: "For a school, with up to five teachers."
};

// Amounts come from the billing price catalogue, so this page and the checkout
// cannot quote different numbers.
function priceLabels(plan: string) {
  if (plan === "free") return { monthly: "\u20ac0", yearly: "\u2014" };

  const paid = plan as "pro" | "academy";
  return {
    monthly: formatPrice(getPrice(paid, "month")),
    yearly: `${formatPrice(getPrice(paid, "year"))} a year`
  };
}

function limit(value: number | null, singular: string, plural: string) {
  if (value === null) return `Unlimited ${plural}`;
  return `${value} ${value === 1 ? singular : plural}`;
}

/**
 * One list of features, read once per plan.
 *
 * Every card renders every row, in this order, whether the plan has the thing
 * or not — which is what makes "PDF export" the same line on all three columns
 * and lets you read across. The cards used to build their own lists and pad the
 * gaps with an em dash, so a row meant nothing until you had counted down to it
 * in the column beside.
 *
 * `on` is what the tick and cross report, and it is not the same as "has a
 * value": the free plan has one saved exam, which is a thing you get, while it
 * also has ads, which is a thing you would rather not. So each row says for
 * itself which way round it reads.
 *
 * `plans` is the exception to "every card renders every row", and it goes at
 * the end of the list for a reason. A row that only one plan has cannot be
 * compared, so putting it among the shared rows would push everything below it
 * out of line on that card alone — the exact fault this layout was built to
 * fix. Below them it costs nothing: the seven rows above stay level across all
 * three columns, and Academy simply runs one longer.
 */
const FEATURES: {
  key: string;
  /** Which plans show this row at all. Absent means all of them. */
  plans?: readonly Plan[];
  of: (e: Entitlements) => { on: boolean; text: string };
}[] = [
  {
    key: "questions",
    of: () => ({ on: true, text: "Unlimited questions" })
  },
  {
    key: "exams",
    of: (e) => ({ on: true, text: limit(e.exams, "saved exam", "saved exams") })
  },
  {
    key: "practices",
    of: (e) => ({ on: true, text: limit(e.practices, "practice", "practices") })
  },
  {
    key: "pdf",
    of: (e) => ({ on: e.pdfExport, text: "PDF export" })
  },
  {
    key: "branding",
    of: (e) => ({ on: e.branding, text: "Your school's branding" })
  },
  {
    /* The one row whose tick is for the absence of something. Ads are a cost to
       the reader, so having them is the cross. */
    key: "ads",
    of: (e) => ({ on: !e.ads, text: e.ads ? "Includes ads" : "No ads" })
  },
  {
    key: "seats",
    of: (e) => ({
      on: true,
      text: `${e.seats} ${e.seats === 1 ? "teacher" : "teachers"}`
    })
  },
  {
    /* Academy only, and shown on no other card — a cross here would advertise
       something the other two plans have no use for, since neither has a school
       to pool anything with. Questions, exams and practices written inside a
       school already carry its organization_id, so this is describing what
       migration 014 built rather than promising it. */
    key: "pooling",
    plans: ["academy"],
    of: () => ({ on: true, text: "Pool resources across your school" })
  }
];

function featuresFor(plan: Plan) {
  return FEATURES.filter((f) => !f.plans || f.plans.includes(plan));
}

/* The longest card sets the number of feature rows, and every card reserves all
   of them so that the actions below still start on the same line. A card with
   fewer simply leaves the last one empty. */
const FEATURE_ROWS = Math.max(...PLANS.map((plan) => featuresFor(plan).length));

/* Name, price, yearly, blurb, one per feature row, then the actions. The
   container declares them so that every card can share them. */
const CARD_ROWS = 4 + FEATURE_ROWS + 1;

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const userId = await getAuthenticatedUserId();
  const profile = userId ? await getProfile(userId) : null;
  const currentPlan = profile?.plan ?? null;
  const billingEnabled = isBillingEnabled();

  return (
    <div className="page" style={{ paddingTop: "4rem" }}>
      <div>
        <h1>Plans</h1>
        <Lead>
          Your question bank is unlimited on every plan, including the free one.
          Paying lifts the limits on saved exams and practices.
        </Lead>

        <PlanGrid $rows={CARD_ROWS}>
          {PLANS.map((plan) => {
            const e = ENTITLEMENTS[plan];
            const price = priceLabels(plan);
            const isCurrent = currentPlan === plan;

            return (
              <Card key={plan} className="glass" $current={isCurrent}>
                {isCurrent ? <CurrentBadge>Current plan</CurrentBadge> : null}

                <PlanName $current={isCurrent}>{plan}</PlanName>

                <Price>
                  {price.monthly}
                  {plan !== "free" ? <span>{" / month"}</span> : null}
                </Price>

                <Yearly>{price.yearly}</Yearly>

                <Blurb>{BLURBS[plan]}</Blurb>

                <Features $rows={FEATURE_ROWS}>
                  {featuresFor(plan).map((feature) => {
                    const { on, text } = feature.of(e);
                    return (
                      <Feature key={feature.key} $on={on}>
                        {on ? <Tick /> : <Cross />}
                        <span>{text}</span>
                      </Feature>
                    );
                  })}
                </Features>

                <Actions>
                  <PlanActions
                    plan={plan}
                    currentPlan={currentPlan}
                    signedIn={Boolean(userId)}
                    billingEnabled={billingEnabled}
                  />
                </Actions>
              </Card>
            );
          })}
        </PlanGrid>

        <p
          style={{
            marginTop: "2rem",
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)"
          }}
        >
          {!billingEnabled
            ? "Paid plans are not available to buy yet. The limits above are live."
            : isBillingSimulated()
              ? "Checkout is simulated while a payment provider is being chosen. No card is collected and nothing is charged."
              : "Prices include VAT where applicable."}
        </p>
      </div>
    </div>
  );
}
