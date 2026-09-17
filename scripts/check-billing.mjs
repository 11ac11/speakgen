// The billing skeleton. No provider is configured yet, so this checks two
// things: that every route refuses honestly rather than half-working, and that
// the provider-agnostic reconciliation is correct.
import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";

const BASE = "http://localhost:3001";
const sql = neon(process.env.DATABASE_URL);
let failed = 0;
const pass = (n, ok, d = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${n}${d ? "  " + d : ""}`);
  if (!ok) failed++;
};

const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: `billtest+${Date.now()}@example.com`,
    password: "TestPassw0rd!23",
    name: "Bill Test"
  })
});
const cookie = signup.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
const me = (await signup.json()).user.id;
const json = { "Content-Type": "application/json" };

console.log("ROUTES WITH NO PROVIDER CONFIGURED");
const checkoutAnon = await fetch(`${BASE}/api/billing/checkout`, {
  method: "POST",
  headers: json,
  body: JSON.stringify({ plan: "pro", interval: "month" })
});
pass(
  "checkout requires auth before anything else",
  checkoutAnon.status === 401
);

const checkout = await fetch(`${BASE}/api/billing/checkout`, {
  method: "POST",
  headers: { ...json, Cookie: cookie },
  body: JSON.stringify({ plan: "pro", interval: "month" })
});
pass(
  "checkout answers 503, not 500",
  checkout.status === 503,
  JSON.stringify(await checkout.json())
);

const badPlan = await fetch(`${BASE}/api/billing/checkout`, {
  method: "POST",
  headers: { ...json, Cookie: cookie },
  body: JSON.stringify({ plan: "free", interval: "month" })
});
pass("free is not purchasable", badPlan.status === 400);

const portal = await fetch(`${BASE}/api/billing/portal`, {
  method: "POST",
  headers: { ...json, Cookie: cookie }
});
pass("portal answers 503", portal.status === 503);

const hook = await fetch(`${BASE}/api/billing/webhook`, {
  method: "POST",
  headers: json,
  body: JSON.stringify({ id: "evt_1" })
});
pass(
  "webhook answers 503 and never trusts an unsigned body",
  hook.status === 503
);

console.log("\nRECONCILIATION (provider-agnostic)");
const state = {
  provider: "stripe",
  providerCustomerId: "cus_test",
  providerSubscriptionId: "sub_recon_1",
  subject: { kind: "user", userId: me },
  plan: "pro",
  status: "active",
  interval: "month",
  seats: 1,
  currentPeriodEnd: new Date(Date.now() + 2.6e9).toISOString(),
  cancelAtPeriodEnd: false
};

// Applied directly: the module is server-only, so drive the same SQL it runs.
const apply = async (s) => {
  const effective = ["trialing", "active", "past_due"].includes(s.status)
    ? s.plan
    : "free";
  await sql(
    `WITH upserted AS (
       INSERT INTO content.subscriptions
         (user_id, organization_id, plan, status, billing_interval, seats,
          provider, provider_customer_id, provider_subscription_id,
          current_period_end, cancel_at_period_end)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (provider, provider_subscription_id) DO UPDATE SET
         plan=EXCLUDED.plan, status=EXCLUDED.status,
         billing_interval=EXCLUDED.billing_interval, seats=EXCLUDED.seats,
         provider_customer_id=EXCLUDED.provider_customer_id,
         current_period_end=EXCLUDED.current_period_end,
         cancel_at_period_end=EXCLUDED.cancel_at_period_end
       RETURNING user_id
     )
     INSERT INTO content.user_profiles (user_id, plan, plan_since)
     SELECT upserted.user_id, $12, now() FROM upserted WHERE upserted.user_id IS NOT NULL
     ON CONFLICT (user_id) DO UPDATE SET
       plan = EXCLUDED.plan,
       plan_since = CASE WHEN content.user_profiles.plan IS DISTINCT FROM EXCLUDED.plan
                         THEN now() ELSE content.user_profiles.plan_since END`,
    [
      s.subject.userId,
      null,
      s.plan,
      s.status,
      s.interval,
      s.seats,
      s.provider,
      s.providerCustomerId,
      s.providerSubscriptionId,
      s.currentPeriodEnd,
      s.cancelAtPeriodEnd,
      effective
    ]
  );
};
const planOf = async () => {
  const rows = await sql(
    `SELECT plan FROM content.user_profiles WHERE user_id=$1`,
    [me]
  );
  return rows[0]?.plan ?? "(no profile row)";
};
const subCount = async () =>
  (
    await sql(
      `SELECT count(*)::int n FROM content.subscriptions WHERE user_id=$1`,
      [me]
    )
  )[0].n;

pass(
  "a fresh signup has no profile row yet",
  (await planOf()) === "(no profile row)"
);
await apply(state);
pass(
  "paying creates the profile and applies the plan",
  (await planOf()) === "pro",
  "an UPDATE would have silently dropped it"
);
pass("one subscription row", (await subCount()) === 1);

await apply(state);
pass(
  "replaying the same subscription is idempotent",
  (await subCount()) === 1 && (await planOf()) === "pro"
);

await apply({ ...state, status: "past_due" });
pass("past_due keeps access (grace, not cut-off)", (await planOf()) === "pro");

await apply({ ...state, status: "canceled" });
pass("cancelled drops to free", (await planOf()) === "free");
pass("cancelled row kept for history", (await subCount()) === 1);

await apply({ ...state, plan: "academy", status: "active", interval: "year" });
pass("upgrade applies", (await planOf()) === "academy");

console.log("\nEVENT IDEMPOTENCY");
const claim = async (id) =>
  (
    await sql(
      `INSERT INTO content.billing_events (provider,event_id,event_type,payload)
    VALUES ('stripe',$1,'test',NULL) ON CONFLICT DO NOTHING RETURNING event_id`,
      [id]
    )
  ).length > 0;
pass("first delivery is claimed", (await claim("evt_dup_1")) === true);
pass("retry is recognised as duplicate", (await claim("evt_dup_1")) === false);
await sql(`DELETE FROM content.billing_events WHERE event_id=$1`, [
  "evt_dup_1"
]);
pass("released claim can be retried", (await claim("evt_dup_1")) === true);

console.log("\nCLEANUP");
await sql(`DELETE FROM content.billing_events WHERE event_id LIKE 'evt_dup_%'`);
await sql(`DELETE FROM neon_auth."user" WHERE id=$1`, [me]);
const [left] = await sql(`SELECT
  (SELECT count(*)::int FROM content.subscriptions) subs,
  (SELECT count(*)::int FROM content.billing_events) events`);
pass(
  "test rows removed with the user",
  left.subs === 0 && left.events === 0,
  JSON.stringify(left)
);

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
