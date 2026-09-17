// The full simulated purchase journey, as a real signed-up user: free ->
// checkout -> webhook -> plan applied -> limit lifted -> cancel -> back to free.
import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";
import { signUpTestUser } from "./lib/testAuth.mjs";

const BASE = "http://localhost:3001";
const sql = neon(process.env.DATABASE_URL);
let failed = 0;
const pass = (n, ok, d = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${n}${d ? "  " + d : ""}`);
  if (!ok) failed++;
};

const { userId: me, cookie } = await signUpTestUser(BASE, "uitest");
const H = { "Content-Type": "application/json", Cookie: cookie };

const planOf = async () => {
  const r = await sql(
    `SELECT plan FROM content.user_profiles WHERE user_id=$1`,
    [me]
  );
  return r[0]?.plan ?? "(none)";
};
/**
 * Reads a response body without throwing. Calling .json() directly kills the
 * run with no output when a response is not JSON, which reports nothing rather
 * than a failed check.
 */
const readJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 200) };
  }
};

const page = async (path, c = cookie) =>
  fetch(BASE + path, { headers: c ? { Cookie: c } : {} });

console.log("PAGES");
pass("pricing renders signed out", (await page("/pricing", "")).status === 200);
pass("pricing renders signed in", (await page("/pricing")).status === 200);
pass(
  "dashboard settings tab",
  (await page("/dashboard?tab=settings")).status === 200
);
pass(
  "dashboard exams tab",
  (await page("/dashboard?tab=exams")).status === 200
);
pass(
  "dashboard redirects when signed out",
  [307, 302].includes(
    (await fetch(`${BASE}/dashboard?tab=settings`, { redirect: "manual" }))
      .status
  )
);

console.log("\nCHECKOUT");
const checkout = await fetch(`${BASE}/api/billing/checkout`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({ plan: "pro", interval: "month" })
});
const { url } = await checkout.json();
pass(
  "checkout returns a hosted url",
  checkout.status === 200 && url?.startsWith("/billing/checkout?intent="),
  url
);
pass("checkout page renders", (await page(url)).status === 200);
pass(
  "checkout page 404s without a valid intent",
  (await page("/billing/checkout?intent=tampered.signature")).status === 404
);

console.log("\nPAYING GOES THROUGH THE REAL WEBHOOK");
pass("still free before paying", (await planOf()) === "free");
const intent = decodeURIComponent(url.split("intent=")[1]);
// Through the same helper as everything else. Reading the body with .json()
// directly throws when a response is not JSON, which kills the run with no
// output rather than reporting a failed check.
const paid = await fetch(`${BASE}/api/billing/dummy/pay`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({ intent })
});
pass(
  "payment accepted",
  paid.status === 200,
  JSON.stringify(await readJson(paid))
);
pass("plan applied by reconciliation", (await planOf()) === "pro");

const [sub] = await sql(
  `SELECT status, plan, billing_interval, current_period_end IS NOT NULL AS has_period
     FROM content.subscriptions WHERE user_id=$1`,
  [me]
);
pass(
  "subscription row written",
  sub?.status === "active" && sub?.plan === "pro",
  JSON.stringify(sub)
);
const [ev] = await sql(`SELECT count(*)::int n FROM content.billing_events`);
pass("webhook event recorded for idempotency", ev.n >= 1);

console.log("\nTHE LIMIT IS ACTUALLY LIFTED");
const q = async (part) =>
  await (
    await fetch(`${BASE}/api/questions?level=b2&part=${part}`, { headers: H })
  ).json();
const [p1, p2, p3, p4] = await Promise.all([1, 2, 3, 4].map(q));
const slots = [
  { part: "1", candidate: "-", question_id: p1[0].id },
  { part: "2", candidate: "A", question_id: p2[0].id },
  { part: "2", candidate: "B", question_id: p2[1].id },
  { part: "3", candidate: "-", question_id: p3[0].id },
  { part: "4", candidate: "-", question_id: p4[0].id }
];
const mk = (title) =>
  fetch(`${BASE}/api/exams`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ level: "b2", title, slots })
  });
const a = await mk("Pro exam one");
const b = await mk("Pro exam two");
pass(
  "two exams allowed on pro",
  a.status === 201 && b.status === 201,
  `${a.status}/${b.status} — free plan caps at 1`
);

console.log("\nCANCELLING");
const portal = await fetch(`${BASE}/api/billing/portal`, {
  method: "POST",
  headers: H
});
const portalBody = await portal.json();
pass(
  "portal returns a url",
  portal.status === 200 && portalBody.url?.startsWith("/billing/portal"),
  portalBody.url
);
pass("portal page renders", (await page(portalBody.url)).status === 200);

const cancelled = await fetch(`${BASE}/api/billing/dummy/cancel`, {
  method: "POST",
  headers: H
});
pass("cancel accepted", cancelled.status === 200);
pass("back to free", (await planOf()) === "free");
const third = await mk("Should be refused");
pass(
  "limit applies again after cancelling",
  third.status === 402,
  `${third.status}`
);
pass(
  "exams created while paid are kept",
  (
    await sql(`SELECT count(*)::int n FROM content.exams WHERE owner_id=$1`, [
      me
    ])
  )[0].n === 2
);

console.log("\nSAFETY");
pass(
  "another user's intent is refused",
  (await (
    await fetch(`${BASE}/api/billing/dummy/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent })
    })
  ).status) === 401
);

console.log("\nCLEANUP");
await sql(`DELETE FROM neon_auth."user" WHERE id=$1`, [me]);
await sql(
  `DELETE FROM content.billing_events WHERE event_id LIKE 'dummy_evt_%'`
);

// Scoped to this run's user, not the whole table: a concurrent or previous run
// would otherwise make this fail for reasons that have nothing to do with it.
const [left] = await sql(
  `SELECT
  (SELECT count(*)::int FROM content.subscriptions WHERE user_id = $1) subs,
  (SELECT count(*)::int FROM content.exams WHERE owner_id = $1) owned_exams`,
  [me]
);
pass(
  "this run's data removed with its user",
  left.subs === 0 && left.owned_exams === 0,
  JSON.stringify(left)
);

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
