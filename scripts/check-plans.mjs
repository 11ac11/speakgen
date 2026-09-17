// Verifies the plan model: schema shape, the constraints that protect it, and
// the profile/credit helpers against the live database.
import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";
import { signUpTestUser } from "./lib/testAuth.mjs";

const sql = neon(process.env.DATABASE_URL);
let failed = 0;
const pass = (name, ok, detail = "") => {
  console.log(
    `${ok ? "  ok  " : "  FAIL"} ${name}${detail ? "  " + detail : ""}`
  );
  if (!ok) failed++;
};
const rejects = async (name, query, params = []) => {
  try {
    await sql(query, params);
    pass(name, false, "ACCEPTED");
  } catch {
    pass(name, true);
  }
};

console.log("SCHEMA");
// Not "every user has a profile": a user who signs up and never writes anything
// legitimately has none, since the row appears on first authenticated write, on
// a dashboard visit, or when a plan is read. The invariant that matters is that
// nobody who owns something, or is paying, is missing one.
const orphans = await sql(`
  SELECT DISTINCT owner AS user_id FROM (
    SELECT owner_id AS owner FROM content.questions WHERE owner_id IS NOT NULL
    UNION SELECT owner_id FROM content.exams WHERE owner_id IS NOT NULL
    UNION SELECT user_id FROM content.subscriptions WHERE user_id IS NOT NULL
  ) o
  WHERE NOT EXISTS (
    SELECT 1 FROM content.user_profiles p WHERE p.user_id = o.owner
  )`);
pass(
  "everyone who owns content or pays has a profile",
  orphans.length === 0,
  orphans.length ? JSON.stringify(orphans) : ""
);

const cols =
  await sql(`SELECT table_name, count(*)::int n FROM information_schema.columns
  WHERE table_schema='content' AND table_name IN ('subscriptions','ai_credit_events')
  GROUP BY table_name ORDER BY table_name`);
pass(
  "subscriptions and ai_credit_events exist",
  cols.length === 2,
  JSON.stringify(cols)
);
const [v] = await sql(`SELECT count(*)::int n FROM information_schema.views
  WHERE table_schema='content' AND table_name='ai_credit_balances'`);
pass("ai_credit_balances view exists", v.n === 1);

console.log("\nCONSTRAINTS");
// A throwaway user, never a real one. This used to take the first row of
// neon_auth."user" and write to its profile and subscriptions, which meant
// running the suite could and did clobber a real account's plan.
const BASE = "http://localhost:3001";
const me = { id: (await signUpTestUser(BASE, "plancheck")).userId };

// Profiles appear on first authenticated write, so a fresh signup has none and
// the UPDATEs below would silently affect zero rows and prove nothing.
await sql(
  `INSERT INTO content.user_profiles (user_id) VALUES ($1)
   ON CONFLICT (user_id) DO NOTHING`,
  [me.id]
);
await rejects(
  "plan must be a known value",
  `UPDATE content.user_profiles SET plan='enterprise' WHERE user_id=$1`,
  [me.id]
);
pass(
  "academy is now a valid plan",
  await sql(
    `UPDATE content.user_profiles SET plan='academy' WHERE user_id=$1 RETURNING plan`,
    [me.id]
  )
    .then((r) => r[0].plan === "academy")
    .catch(() => false)
);
await sql(`UPDATE content.user_profiles SET plan='free' WHERE user_id=$1`, [
  me.id
]);

await rejects(
  "subscription needs a subject",
  `INSERT INTO content.subscriptions (plan,status,billing_interval,provider)
   VALUES ('pro','active','month','stripe')`
);
await rejects(
  "subscription cannot have both subjects",
  `INSERT INTO content.subscriptions (user_id,organization_id,plan,status,billing_interval,provider)
   VALUES ($1,$1,'pro','active','month','stripe')`,
  [me.id]
);
await rejects(
  "unknown provider rejected",
  `INSERT INTO content.subscriptions (user_id,plan,status,billing_interval,provider)
   VALUES ($1,'pro','active','month','bitcoin')`,
  [me.id]
);
await rejects(
  "free is not a subscribable plan",
  `INSERT INTO content.subscriptions (user_id,plan,status,billing_interval,provider)
   VALUES ($1,'free','active','month','stripe')`,
  [me.id]
);

await sql(
  `INSERT INTO content.subscriptions
  (user_id,plan,status,billing_interval,provider,provider_subscription_id)
  VALUES ($1,'pro','active','month','stripe','sub_test_1')`,
  [me.id]
);
await rejects(
  "only one live subscription per user",
  `INSERT INTO content.subscriptions
   (user_id,plan,status,billing_interval,provider,provider_subscription_id)
   VALUES ($1,'academy','active','year','stripe','sub_test_2')`,
  [me.id]
);
await sql(
  `UPDATE content.subscriptions SET status='canceled' WHERE provider_subscription_id='sub_test_1'`
);
pass(
  "a second subscription is allowed once the first is cancelled",
  await sql(
    `INSERT INTO content.subscriptions
    (user_id,plan,status,billing_interval,provider,provider_subscription_id)
    VALUES ($1,'academy','active','year','stripe','sub_test_2') RETURNING id`,
    [me.id]
  )
    .then(() => true)
    .catch(() => false)
);
await rejects(
  "provider subscription id is unique",
  `INSERT INTO content.subscriptions
   (user_id,plan,status,billing_interval,provider,provider_subscription_id)
   VALUES ($1,'pro','incomplete','month','stripe','sub_test_2')`,
  [me.id]
);

console.log("\nAI CREDITS");
await rejects(
  "zero-delta credit event rejected",
  `INSERT INTO content.ai_credit_events (user_id,delta,reason) VALUES ($1,0,'adjustment')`,
  [me.id]
);
await sql(
  `INSERT INTO content.ai_credit_events (user_id,delta,reason) VALUES ($1,100,'purchase')`,
  [me.id]
);
await sql(
  `INSERT INTO content.ai_credit_events (user_id,delta,reason) VALUES ($1,-3,'generation')`,
  [me.id]
);
const [b] = await sql(
  `SELECT balance FROM content.ai_credit_balances WHERE user_id=$1`,
  [me.id]
);
pass("balance is the sum of the ledger", b.balance === 97, `${b.balance}`);

console.log("\nCLEANUP");
await sql(
  `DELETE FROM content.subscriptions WHERE provider_subscription_id LIKE 'sub_test_%'`
);
await sql(
  `DELETE FROM content.ai_credit_events WHERE user_id=$1 AND reason IN ('purchase','generation')`,
  [me.id]
);
// Scoped to the row this run touched. Counting whole tables makes the check
// fail whenever another suite is mid-flight, for reasons unrelated to it.
const [left] = await sql(
  `SELECT
     (SELECT count(*)::int FROM content.subscriptions WHERE user_id = $1) subs,
     (SELECT count(*)::int FROM content.ai_credit_events WHERE user_id = $1) events`,
  [me.id]
);
await sql(`DELETE FROM neon_auth."user" WHERE id=$1`, [me.id]);
pass(
  "this run's rows removed",
  left.subs === 0 && left.events === 0,
  JSON.stringify(left)
);

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
