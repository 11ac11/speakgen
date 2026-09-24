// Deleting your own account, and the nudge to cancel a Pro the school's
// Academy already covers. The assertions that matter are about what is NOT
// deleted: a school's content, the school itself, and anyone's billing.
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
const json = async (res) => {
  const t = await res.text();
  try {
    return JSON.parse(t);
  } catch {
    return { error: t.slice(0, 160) };
  }
};
const call = (path, user, body, method = "POST") =>
  fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", Cookie: user?.cookie ?? "" },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
const remove = (user, confirm) =>
  call("/api/account", user, { confirm: confirm ?? user.email }, "DELETE");
const exists = async (id) =>
  (await sql(`SELECT 1 FROM neon_auth."user" WHERE id = $1`, [id])).length > 0;
const makeSchool = async (owner, name) =>
  (
    await json(
      await call("/api/auth/organization/create", owner, {
        name,
        slug: `acct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      })
    )
  ).id;
const join = (schoolId, user, role = "member") =>
  sql(
    `INSERT INTO neon_auth.member (id, "organizationId", "userId", role, "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, now())`,
    [schoolId, user.userId, role]
  );
const question = async (user, statement) =>
  json(
    await call("/api/questions", user, {
      level: "b2",
      part: "1",
      statement,
      themes: ["hobbies"]
    })
  );
const slots = async (user) => {
  const byPart = {};
  for (const part of ["1", "2", "3", "4"]) {
    byPart[part] = await json(
      await fetch(`${BASE}/api/questions?level=b2&part=${part}`, {
        headers: { Cookie: user.cookie }
      })
    );
  }
  return [
    ["1", "-", 0],
    ["2", "A", 0],
    ["2", "B", 1],
    ["3", "-", 0],
    ["4", "-", 0]
  ].map(([part, candidate, n]) => ({
    part,
    candidate,
    question_id: byPart[part][n].id
  }));
};

const users = [];
const schools = [];
const signUp = async (name) => {
  const u = await signUpTestUser(BASE, name);
  users.push(u);
  return u;
};

try {
  console.log("PERSONAL CONTENT GOES");
  const solo = await signUp("acct-solo");
  const q = await question(solo, "Solo's private question");
  const exam = await json(
    await call("/api/exams", solo, {
      level: "b2",
      title: "Solo's exam",
      slots: await slots(solo)
    })
  );
  const plan = await json(await call("/api/account", solo, null, "GET"));
  pass(
    "the plan counts what will be deleted",
    plan.personal?.questions === 1 &&
      plan.personal?.exams === 1 &&
      plan.blockers?.length === 0,
    JSON.stringify(plan.personal)
  );
  pass(
    "a wrong email is refused, and nothing changes",
    (await remove(solo, "not-my-email@example.com")).status === 400 &&
      (await exists(solo.userId))
  );
  pass("the right email deletes it", (await remove(solo)).status === 200);
  pass("the account is gone", !(await exists(solo.userId)));
  const [left] = await sql(
    `SELECT (SELECT count(*)::int FROM content.questions WHERE id = $1) q,
            (SELECT count(*)::int FROM content.exams WHERE id = $2) e`,
    [q.id, exam.id]
  );
  pass(
    "with its questions and exams",
    left.q === 0 && left.e === 0,
    JSON.stringify(left)
  );
  // Its sessions are deleted with it. Neon Auth also keeps a five-minute
  // copy of the session in a cookie, which the panel clears by signing out
  // straight after; a raw cookie replayed here would still be honoured until
  // that copy expires, so the database is what is checked.
  const [sessions] = await sql(
    `SELECT count(*)::int n FROM neon_auth.session WHERE "userId" = $1`,
    [solo.userId]
  );
  pass("and every session it had", sessions.n === 0, `${sessions.n} left`);

  console.log("\nA MEMBER LEAVES: THEIR SCHOOL CONTENT STAYS");
  const owner = await signUp("acct-owner");
  const member = await signUp("acct-member");
  const school = await makeSchool(owner, "Account Test School");
  schools.push(school);
  await join(school, member);
  // Written by the member inside the school, so it belongs to the school.
  await call("/api/auth/organization/set-active", member, {
    organizationId: school
  });
  const schoolQ = await question(member, "Written at the school");
  const [before] = await sql(
    `SELECT organization_id FROM content.questions WHERE id = $1`,
    [schoolQ.id]
  );
  pass(
    "the question belongs to the school",
    before?.organization_id === school
  );
  // And a private question of the member's own, used in a school exam.
  const [privateQ] = await sql(
    `INSERT INTO content.questions (level, part, owner_id, visibility, statement)
     VALUES ('b2', 1, $1, 'private', 'Member private, used by the school')
     RETURNING id::int AS id`,
    [member.userId]
  );
  await sql(`INSERT INTO content.question_themes VALUES ($1, 'hobbies')`, [
    privateQ.id
  ]);
  const memberSlots = (await slots(member)).map((s) =>
    s.part === "1" ? { ...s, question_id: privateQ.id } : s
  );
  const schoolExam = await json(
    await call("/api/exams", member, {
      level: "b2",
      title: "School exam",
      slots: memberSlots
    })
  );
  const [examOrg] = await sql(
    `SELECT organization_id FROM content.exams WHERE id = $1`,
    [schoolExam.id]
  );
  pass("the exam belongs to the school", examOrg?.organization_id === school);

  const memberPlan = await json(
    await call("/api/account", member, null, "GET")
  );
  pass(
    "the plan says the school keeps it, owned by the owner",
    memberPlan.schools?.[0]?.outcome === "keep" &&
      memberPlan.schools?.[0]?.promotes === false,
    JSON.stringify(memberPlan.schools?.[0]?.successor)
  );
  pass(
    "the member deletes their account",
    (await remove(member)).status === 200
  );
  const [kept] = await sql(
    `SELECT owner_id, organization_id FROM content.questions WHERE id = $1`,
    [schoolQ.id]
  );
  pass(
    "the school's question stays, now owned by the owner",
    kept?.owner_id === owner.userId && kept?.organization_id === school,
    JSON.stringify(kept)
  );
  const [examAfter] = await sql(
    `SELECT e.owner_id, (SELECT count(*)::int FROM content.exam_questions WHERE exam_id = e.id) slots
       FROM content.exams e WHERE e.id = $1`,
    [schoolExam.id]
  );
  pass(
    "the school's exam stays whole",
    examAfter?.owner_id === owner.userId && examAfter?.slots === 5,
    JSON.stringify(examAfter)
  );
  const [moved] = await sql(
    `SELECT owner_id, organization_id FROM content.questions WHERE id = $1`,
    [privateQ.id]
  );
  pass(
    "and the private question it used went with it, to the school",
    moved?.owner_id === owner.userId && moved?.organization_id === school,
    JSON.stringify(moved)
  );

  console.log("\nTHE OWNER LEAVES: A SUCCESSOR IS PROMOTED");
  const admin = await signUp("acct-admin");
  await join(school, admin, "admin");
  pass("the owner deletes their account", (await remove(owner)).status === 200);
  const [promoted] = await sql(
    `SELECT role FROM neon_auth.member WHERE "organizationId" = $1 AND "userId" = $2`,
    [school, admin.userId]
  );
  pass(
    "the admin is now the owner",
    promoted?.role === "owner",
    promoted?.role
  );
  const [schoolStill] = await sql(
    `SELECT count(*)::int n FROM neon_auth.organization WHERE id = $1`,
    [school]
  );
  pass("the school is still there", schoolStill.n === 1);
  const [q2] = await sql(
    `SELECT owner_id FROM content.questions WHERE id = $1`,
    [schoolQ.id]
  );
  pass("its content followed to the new owner", q2?.owner_id === admin.userId);

  console.log("\nBILLING BLOCKS DELETION");
  const payer = await signUp("acct-payer");
  await sql(
    `INSERT INTO content.subscriptions (user_id, plan, status, billing_interval, seats, provider, provider_subscription_id, provider_customer_id)
     VALUES ($1, 'pro', 'active', 'month', 1, 'stripe', $2, $3)`,
    [
      payer.userId,
      `dummy_sub_acct_${Date.now()}`,
      `dummy_cus_acct_${Date.now()}`
    ]
  );
  const blocked = await remove(payer);
  pass(
    "a live Pro subscription blocks it",
    blocked.status === 409 && (await exists(payer.userId)),
    `${blocked.status}`
  );

  const lastTeacher = await signUp("acct-last");
  const soloSchool = await makeSchool(lastTeacher, "Last Teacher School");
  schools.push(soloSchool);
  await sql(
    `INSERT INTO content.subscriptions (organization_id, plan, status, billing_interval, seats, provider, provider_subscription_id)
     VALUES ($1, 'academy', 'active', 'month', 5, 'stripe', $2)`,
    [soloSchool, `dummy_sub_last_${Date.now()}`]
  );
  pass(
    "being the last teacher of a paying school blocks it",
    (await remove(lastTeacher)).status === 409 &&
      (await exists(lastTeacher.userId))
  );
  await sql(
    `UPDATE content.subscriptions SET status = 'canceled' WHERE organization_id = $1`,
    [soloSchool]
  );
  pass(
    "once cancelled, it goes ahead",
    (await remove(lastTeacher)).status === 200
  );
  const [gone] = await sql(
    `SELECT count(*)::int n FROM neon_auth.organization WHERE id = $1`,
    [soloSchool]
  );
  pass("and the empty school goes with it", gone.n === 0);

  console.log("\nTHE NUDGE: PRO WHILE THE SCHOOL PAYS FOR ACADEMY");
  // The payer from above still has live Pro; their school now buys Academy.
  const paidSchool = await makeSchool(payer, "Paying School");
  schools.push(paidSchool);
  await sql(
    `INSERT INTO content.subscriptions (organization_id, plan, status, billing_interval, seats, provider, provider_subscription_id, provider_customer_id)
     VALUES ($1, 'academy', 'active', 'month', 5, 'stripe', $2, $3)`,
    [paidSchool, `dummy_sub_paid_${Date.now()}`, `dummy_cus_paid_${Date.now()}`]
  );
  const settings = await (
    await fetch(`${BASE}/settings`, { headers: { Cookie: payer.cookie } })
  ).text();
  pass(
    "Settings suggests cancelling the Pro",
    settings.includes("stop being charged twice") &&
      settings.includes("Cancel my Pro")
  );
  const portal = await json(
    await call("/api/billing/portal", payer, { scope: "personal" })
  );
  pass(
    "the personal portal is the personal one",
    String(portal.url).includes("scope=personal"),
    portal.url
  );
  const cancel = await call("/api/billing/dummy/cancel", payer, {
    scope: "personal"
  });
  pass("cancelling it works", cancel.status === 200, `${cancel.status}`);
  const [subs] = await sql(
    `SELECT (SELECT status FROM content.subscriptions WHERE user_id = $1) personal,
            (SELECT status FROM content.subscriptions WHERE organization_id = $2) school`,
    [payer.userId, paidSchool]
  );
  pass(
    "it cancels the Pro and leaves the school's Academy alone",
    subs.personal === "canceled" && subs.school === "active",
    JSON.stringify(subs)
  );
  const after = await (
    await fetch(`${BASE}/settings`, { headers: { Cookie: payer.cookie } })
  ).text();
  pass("and the nudge is gone", !after.includes("stop being charged twice"));
} catch (error) {
  pass("suite ran to the end", false, error.message);
} finally {
  console.log("\nCLEANUP");
  for (const s of schools) {
    await sql(`DELETE FROM neon_auth.organization WHERE id = $1`, [s]);
  }
  for (const u of users) {
    await sql(`DELETE FROM content.exams WHERE owner_id = $1`, [u.userId]);
    await sql(`DELETE FROM neon_auth."user" WHERE id = $1`, [u.userId]);
  }
  const [rest] = await sql(
    `SELECT count(*)::int n FROM neon_auth."user" WHERE id = ANY($1::uuid[])`,
    [users.map((u) => u.userId)]
  );
  pass("test accounts removed", rest.n === 0);
}

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
