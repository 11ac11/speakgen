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
import { getEffectivePlan } from "@/lib/profile";
import PlanActions from "./PlanActions";
import { getWaitlistPlans, isWaitlistMode } from "@/lib/waitlist";

export const metadata = {
  title: "Plans",
  description:
    "SpeakGen is free to start, with unlimited questions. Pro lifts the limits on saved exams and practices and adds PDF export; Academy is for a school of up to five teachers."
};

const BLURBS: Record<string, string> = {
  free: "Everything you need to try it with a class.",
  pro: "For a teacher running their own classes.",
  academy: "For a school, with up to five teachers."
};

// Amounts come from the billing price catalogue, so this page and the checkout
// cannot quote different numbers.
function priceLabels(plan: string, waitlist: boolean) {
  /* No amounts at all while paid plans are not on sale: a price with no way
     to pay it is a promise, and the prices are not settled. */
  if (waitlist) {
    return plan === "free"
      ? { monthly: "Free", yearly: "No card needed" }
      : { monthly: "Coming soon", yearly: "Join the waitlist to hear first" };
  }

  /* "No card needed" rather than an em dash. The band under the price is the
     second thing you read about the cost, and on the free plan the honest
     answer to "and then what?" is that there is no payment step at all — a
     dash left the question hanging next to two cards that answered it. */
  if (plan === "free") return { monthly: "\u20ac0", yearly: "No card needed" };

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
 * fix. Below them it costs nothing: the eight rows above stay level across all
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
    /* Ticked on every plan, deliberately: share links are how the product
       reaches students and other teachers, so they are never behind a paywall.
       Saying so on the free card is part of the pitch, not filler. */
    key: "share",
    of: () => ({ on: true, text: "Private links to share with students" })
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

  /* getEffectivePlan rather than getProfile, which was wrong twice.
     
     It read a row that may not exist: signing up does not create one, only
     ensureProfile does, and nothing on the way here called it — so a teacher
     who signed up and came straight to this page saw no current plan at all.
     getEffectivePlan creates the row on sight.

     And it ignored school membership. A teacher whose school pays for Academy
     has "free" on their own profile, because the subscription belongs to the
     organisation; this page would have badged their Free card and offered to
     sell them Pro. */
  const currentPlan = userId ? await getEffectivePlan(userId) : null;
  const billingEnabled = isBillingEnabled();
  const waitlistMode = isWaitlistMode();
  const lists = userId ? await getWaitlistPlans(userId) : [];

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
            const price = priceLabels(plan, waitlistMode);
            const isCurrent = currentPlan === plan;

            return (
              <Card key={plan} className="glass" $current={isCurrent}>
                {isCurrent ? <CurrentBadge>Current plan</CurrentBadge> : null}

                <PlanName $current={isCurrent}>{plan}</PlanName>

                <Price>
                  {price.monthly}
                  {plan !== "free" && !waitlistMode ? (
                    <span>{" / month"}</span>
                  ) : null}
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
                    waitlist={{
                      mode: waitlistMode,
                      joined: plan !== "free" && lists.includes(plan),
                      bonusAvailable: lists.length === 0
                    }}
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
          {waitlistMode
            ? "Pro and Academy are not on sale yet. Join a waitlist and we will tell you when they open — and if you have a free account, joining adds an extra saved exam to it."
            : !billingEnabled
              ? "Paid plans are not available to buy yet. The limits above are live."
              : isBillingSimulated()
                ? "Checkout is simulated while a payment provider is being chosen. No card is collected and nothing is charged."
                : "Prices include VAT where applicable."}
        </p>
      </div>
    </div>
  );
}
