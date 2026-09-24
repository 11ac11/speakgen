// Ads must appear only where agreed, only for plans that carry them, and only
// after consent. The important assertions are the negative ones.
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

const CONSENT = "speakgen_ad_consent=granted";
const has = (html) =>
  html.includes("data-ad-placement") || html.includes("Ad placeholder");
const get = async (path, cookies = "") =>
  (
    await fetch(BASE + path, { headers: cookies ? { Cookie: cookies } : {} })
  ).text();

console.log("PLACEMENTS THAT CARRY ADS (signed out, consented)");
for (const [name, path] of [
  ["landing", "/"],
  ["about", "/about"],
  ["faqs", "/faqs"]
]) {
  pass(`${name} shows an ad`, has(await get(path, CONSENT)));
}

console.log("\nPLACEMENTS THAT MUST NEVER CARRY ADS");
for (const [name, path] of [
  ["the exam runner", "/b2/exams/1"],
  ["the exam list", "/b2/exams"],
  ["a question", "/b2/questions/random/1"],
  ["pricing", "/pricing"],
  ["login", "/login"],
  ["signup", "/signup"],
  ["simulated checkout", "/billing/checkout"]
]) {
  pass(`${name} has no ad`, !has(await get(path, CONSENT)));
}

console.log("\nCONSENT");
pass("no ad before consent is given", !has(await get("/")));
pass(
  "no ad when consent is refused",
  !has(await get("/", "speakgen_ad_consent=denied"))
);
pass(
  "consent banner is offered",
  (await get("/")).includes("Advertising consent")
);

console.log("\nPLAN");
const { userId: me, cookie: session } = await signUpTestUser(BASE, "adtest");
const withConsent = `${session}; ${CONSENT}`;

pass(
  "free plan sees ads on the dashboard",
  has(await get("/dashboard?tab=questions", withConsent))
);

await sql(`UPDATE content.user_profiles SET plan='pro' WHERE user_id=$1`, [me]);
pass(
  "paid plan sees none on the dashboard",
  !has(await get("/dashboard?tab=questions", withConsent))
);
pass(
  "paid plan sees none on marketing pages",
  !has(await get("/", withConsent))
);
pass(
  "paid plan is never asked about ads",
  !(await get("/", session)).includes("Advertising consent")
);

await sql(`UPDATE content.user_profiles SET plan='free' WHERE user_id=$1`, [
  me
]);
pass(
  "back to free, ads return",
  has(await get("/dashboard?tab=questions", withConsent))
);

console.log("\nCOVERED BY A SCHOOL'S ACADEMY");
// The teacher's own profile says free; the school's subscription says
// Academy. Ads follow the effective plan, so none here, and no banner either.
const school = await (
  await fetch(`${BASE}/api/auth/organization/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: session },
    body: JSON.stringify({
      name: "Ads Test School",
      slug: `ads-test-${Date.now().toString(36)}`
    })
  })
).json();
await sql(
  `INSERT INTO content.subscriptions
     (organization_id, plan, status, billing_interval, seats, provider, provider_subscription_id)
   VALUES ($1,'academy','active','month',5,'stripe',$2)`,
  [school.id, `sub_ads_${Date.now()}`]
);
pass(
  "a teacher on their school's Academy sees no ads",
  !has(await get("/dashboard?tab=questions", withConsent))
);
pass(
  "and is not asked about them",
  !(await get("/", session)).includes("Advertising consent")
);
await sql(`DELETE FROM neon_auth.organization WHERE id=$1`, [school.id]);

console.log("\nCLEANUP");
await sql(`DELETE FROM neon_auth."user" WHERE id=$1`, [me]);
pass(
  "test user removed",
  (
    await sql(`SELECT count(*)::int n FROM neon_auth."user" WHERE id=$1`, [me])
  )[0].n === 0
);

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
