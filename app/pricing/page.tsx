import { PLANS, ENTITLEMENTS } from "@/lib/entitlements";
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

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const userId = await getAuthenticatedUserId();
  const profile = userId ? await getProfile(userId) : null;
  const currentPlan = profile?.plan ?? null;
  const billingEnabled = isBillingEnabled();

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1>Plans</h1>
        <p style={{ marginBottom: "2.5rem", color: "var(--lightgrey)" }}>
          Your question bank is unlimited on every plan, including the free one.
          Paying lifts the limits on saved exams and practices.
        </p>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
          }}
        >
          {PLANS.map((plan) => {
            const e = ENTITLEMENTS[plan];
            const price = priceLabels(plan);

            return (
              <div
                key={plan}
                className="glass"
                style={{ padding: "1.5rem", borderRadius: "1rem" }}
              >
                <strong
                  style={{
                    fontSize: "1.1rem",
                    textTransform: "capitalize",
                    color: "var(--slategrey)"
                  }}
                >
                  {plan}
                </strong>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    margin: "0.5rem 0 0.1rem",
                    color: "var(--slategrey)"
                  }}
                >
                  {price.monthly}
                  {plan !== "free" ? (
                    <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>
                      {" / month"}
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    color: "var(--lightgrey)",
                    fontSize: "0.85rem",
                    marginBottom: "1rem"
                  }}
                >
                  {price.yearly}
                </div>
                <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {BLURBS[plan]}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.9rem",
                    lineHeight: 1.9
                  }}
                >
                  <li>Unlimited questions</li>
                  <li>{limit(e.exams, "saved exam", "saved exams")}</li>
                  <li>{limit(e.practices, "practice", "practices")}</li>
                  <li>{e.pdfExport ? "PDF export" : "—"}</li>
                  <li>{e.branding ? "Your school's branding" : "—"}</li>
                  <li>{e.ads ? "Includes ads" : "No ads"}</li>
                  {e.seats > 1 ? <li>{`${e.seats} teachers`}</li> : null}
                </ul>
                <PlanActions
                  plan={plan}
                  currentPlan={currentPlan}
                  signedIn={Boolean(userId)}
                  billingEnabled={billingEnabled}
                />
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: "2rem",
            color: "var(--lightgrey)",
            fontSize: "0.85rem"
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
