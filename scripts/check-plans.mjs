// Verifies the plan model: schema shape, the constraints that protect it, and
// the profile/credit helpers against the live database.
import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";

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

const [u] = await sql(`SELECT
  (SELECT count(*)::int FROM neon_auth."user") users,
  (SELECT count(*)::int FROM content.user_profiles) profiles`);
console.log("SCHEMA");
pass(
  "every auth user has a profile",
  u.users === u.profiles,
  `${u.profiles}/${u.users}`
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
const [me] = await sql(`SELECT id FROM neon_auth."user" LIMIT 1`);
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
pass(
  "this run's rows removed",
  left.subs === 0 && left.events === 0,
  JSON.stringify(left)
);

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
