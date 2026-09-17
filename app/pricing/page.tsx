import { PLANS, ENTITLEMENTS } from "@/lib/entitlements";

export const metadata = { title: "Plans — Speakgen" };

const PRICES: Record<
  string,
  { monthly: string; yearly: string; blurb: string }
> = {
  free: {
    monthly: "€0",
    yearly: "—",
    blurb: "Everything you need to try it with a class."
  },
  pro: {
    monthly: "€5",
    yearly: "€49 a year",
    blurb: "For a teacher running their own classes."
  },
  academy: {
    monthly: "€29",
    yearly: "€290 a year",
    blurb: "For a school, with up to five teachers."
  }
};

function limit(value: number | null, singular: string, plural: string) {
  if (value === null) return `Unlimited ${plural}`;
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function PricingPage() {
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
            const price = PRICES[plan];

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
                  {price.blurb}
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
          Paid plans are not available to buy yet. The limits above are live.
        </p>
      </div>
    </div>
  );
}
