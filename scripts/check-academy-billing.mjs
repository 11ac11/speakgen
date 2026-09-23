// Buying Academy through the simulated checkout, end to end: who may buy it,
// that it is billed to the school rather than the buyer, that it covers the
// school's teachers, and that only the people who run the school can manage
// or cancel it.
import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";
import { signUpTestUser } from "./lib/testAuth.mjs";

const BASE = process.env.CHECK_BASE ?? "http://localhost:3001";
const sql = neon(process.env.DATABASE_URL);
let failed = 0;
const pass = (n, ok, d = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${n}${d ? "  " + d : ""}`);
  if (!ok) failed++;
};
const readJson = async (res) => {
  const t = await res.text();
  try {
    return JSON.parse(t);
  } catch {
    return { error: t.slice(0, 160) };
  }
};
const call = (path, cookie, body, method = "POST") =>
  fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookie ?? "" },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
const planOf = async (userId) =>
  (
    await sql(
      `SELECT s.plan FROM content.subscriptions s
         JOIN neon_auth.member m ON m."organizationId" = s.organization_id
        WHERE m."userId" = $1 AND s.status IN ('trialing','active','past_due')
       UNION ALL
       SELECT plan FROM content.user_profiles WHERE user_id = $1`,
      [userId]
    )
  ).map((r) => r.plan);

// The intent the checkout URL carries, redeemed the way the checkout page does.
const pay = async (cookie, url) => {
  const intent = new URL(url, BASE).searchParams.get("intent");
  return call("/api/billing/dummy/pay", cookie, { intent });
};

const head = await signUpTestUser(BASE, "acad-head");
const colleague = await signUpTestUser(BASE, "acad-colleague");
const outsider = await signUpTestUser(BASE, "acad-outsider");
let schoolId = null;

try {
  console.log("WHO MAY BUY");
  const noSchool = await call("/api/billing/checkout", head.cookie, {
    plan: "academy",
    interval: "month"
  });
  const noSchoolBody = await readJson(noSchool);
  pass(
    "without a school, checkout asks for one",
    noSchool.status === 409 && noSchoolBody.reason === "no_school",
    `${noSchool.status} ${noSchoolBody.reason}`
  );

  const school = await readJson(
    await call("/api/auth/organization/create", head.cookie, {
      name: "Academy Billing Test School",
      slug: `acad-billing-${Date.now().toString(36)}`
    })
  );
  schoolId = school?.id;
  pass("school created", Boolean(schoolId));

  // The colleague joins as a plain member, straight in the table, since the
  // invitation flow is check-academy's business.
  await sql(
    `INSERT INTO neon_auth.member (id, "organizationId", "userId", role, "createdAt")
     VALUES (gen_random_uuid(), $1, $2, 'member', now())`,
    [schoolId, colleague.userId]
  );

  const notAdmin = await call("/api/billing/checkout", colleague.cookie, {
    plan: "academy",
    interval: "month"
  });
  pass(
    "a plain member cannot buy it for the school",
    notAdmin.status === 403 &&
      (await readJson(notAdmin)).reason === "not_admin",
    `${notAdmin.status}`
  );

  console.log("\nBUYING");
  const checkout = await readJson(
    await call("/api/billing/checkout", head.cookie, {
      plan: "academy",
      interval: "year"
    })
  );
  pass("the owner gets a checkout", Boolean(checkout.url), checkout.url);

  const page = await fetch(BASE + checkout.url, {
    headers: { Cookie: head.cookie }
  });
  const html = await page.text();
  pass(
    "the checkout names the school and its seats",
    page.status === 200 &&
      html.includes("Academy Billing Test School") &&
      html.includes("Up to 5"),
    `${page.status}`
  );

  pass(
    "an outsider cannot redeem the school's checkout",
    (await pay(outsider.cookie, checkout.url)).status === 403
  );

  const paid = await pay(head.cookie, checkout.url);
  pass("the owner pays", paid.status === 200, `${paid.status}`);

  const [sub] = await sql(
    `SELECT user_id, organization_id, plan, seats, billing_interval, status
       FROM content.subscriptions WHERE organization_id = $1`,
    [schoolId]
  );
  pass(
    "billed to the school, not the buyer",
    sub?.organization_id === schoolId &&
      sub?.user_id === null &&
      sub?.plan === "academy" &&
      sub?.seats === 5 &&
      sub?.billing_interval === "year",
    JSON.stringify(sub)
  );
  pass(
    "the owner is on Academy",
    (await planOf(head.userId)).includes("academy")
  );
  pass(
    "so is the colleague, through the school",
    (await planOf(colleague.userId)).includes("academy")
  );
  pass(
    "the outsider is not",
    !(await planOf(outsider.userId)).includes("academy")
  );

  console.log("\nSETTINGS");
  const headSettings = await (
    await fetch(`${BASE}/settings`, { headers: { Cookie: head.cookie } })
  ).text();
  pass(
    "the owner sees the school's billing and can manage it",
    headSettings.includes("for Academy Billing Test School") &&
      headSettings.includes("Manage or cancel")
  );
  const colleagueSettings = await (
    await fetch(`${BASE}/settings`, { headers: { Cookie: colleague.cookie } })
  ).text();
  pass(
    "the colleague is told the school covers them, with no cancel button",
    colleagueSettings.includes("Covered by Academy Billing Test School") &&
      !colleagueSettings.includes("Manage or cancel")
  );

  console.log("\nMANAGING");
  pass(
    "the colleague cannot open the billing portal",
    (await call("/api/billing/portal", colleague.cookie)).status === 403
  );
  pass(
    "the colleague cannot cancel",
    (await call("/api/billing/dummy/cancel", colleague.cookie)).status === 403
  );
  pass(
    "the owner can open the portal",
    (await call("/api/billing/portal", head.cookie)).status === 200
  );
  pass(
    "the owner cancels",
    (await call("/api/billing/dummy/cancel", head.cookie)).status === 200
  );
  pass(
    "and the school's teachers are back to free",
    !(await planOf(head.userId)).includes("academy") &&
      !(await planOf(colleague.userId)).includes("academy")
  );
} catch (error) {
  pass("suite ran to the end", false, error.message);
} finally {
  console.log("\nCLEANUP");
  for (const u of [head, colleague, outsider]) {
    await sql(`DELETE FROM neon_auth."user" WHERE id = $1`, [u.userId]);
  }
  if (schoolId) {
    await sql(`DELETE FROM neon_auth.organization WHERE id = $1`, [schoolId]);
    const [left] = await sql(
      `SELECT count(*)::int AS n FROM content.subscriptions WHERE organization_id = $1`,
      [schoolId]
    );
    pass("school and its subscription removed", left.n === 0);
  }
}

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
