// A school end to end: create it, subscribe it, invite a colleague, share a
// bank, and prove seats and plan inheritance actually bite.
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
    headers: { "Content-Type": "application/json", Cookie: cookie },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

const head = await signUpTestUser(BASE, "school-head");
const teacher = await signUpTestUser(BASE, "school-teacher");
const outsider = await signUpTestUser(BASE, "school-outsider");
console.log(`head ${head.userId}\nteacher ${teacher.userId}\n`);

console.log("CREATING A SCHOOL");
const created = await readJson(
  await call("/api/auth/organization/create", head.cookie, {
    name: "Test Language Academy",
    slug: `test-academy-${Date.now().toString(36)}`
  })
);
const schoolId = created?.id;
pass("school created", Boolean(schoolId), schoolId ?? JSON.stringify(created));
if (!schoolId) {
  console.log("\ncannot continue");
  process.exit(1);
}

pass(
  "creator is the owner",
  (
    await sql(
      `SELECT role FROM neon_auth.member WHERE "organizationId"=$1 AND "userId"=$2`,
      [schoolId, head.userId]
    )
  )[0]?.role === "owner"
);

console.log("\nSEATS GATE INVITES");
const noSeat = await call("/api/auth/organization/invite-member", head.cookie, {
  organizationId: schoolId,
  email: "someone@example.com",
  role: "member"
});
pass(
  "cannot invite with no subscription",
  noSeat.status === 402,
  `${noSeat.status} ${JSON.stringify(await readJson(noSeat))}`
);

// Give the school an Academy subscription, as the billing webhook would.
await sql(
  `INSERT INTO content.subscriptions
     (organization_id, plan, status, billing_interval, seats, provider, provider_subscription_id)
   VALUES ($1,'academy','active','month',2,'stripe',$2)`,
  [schoolId, `sub_school_${Date.now()}`]
);

console.log("\nPLAN INHERITED FROM THE SCHOOL");
const usageOf = async (cookie) => {
  const html = await (
    await fetch(`${BASE}/settings`, {
      headers: { Cookie: cookie }
    })
  ).text();
  return html;
};
pass(
  "head is on academy without a subscription of their own",
  (await usageOf(head.cookie)).includes("academy")
);
pass(
  "head's own profile row is still free",
  (
    await sql(`SELECT plan FROM content.user_profiles WHERE user_id=$1`, [
      head.userId
    ])
  )[0]?.plan === "free",
  "the plan is resolved, not copied"
);

console.log("\nINVITING");
// Invited at the teacher's real address: Better Auth ties an invitation to an
// email and refuses to let anybody else accept it.
const invited = await call(
  "/api/auth/organization/invite-member",
  head.cookie,
  {
    organizationId: schoolId,
    email: teacher.email,
    role: "member"
  }
);
const invitation = await readJson(invited);
pass(
  "invite accepted once there are seats",
  invited.status === 200,
  `${invited.status}`
);
pass(
  "invitation recorded",
  Boolean(invitation?.id),
  invitation?.id ?? JSON.stringify(invitation)
);

pass(
  "a non-admin cannot invite",
  (
    await call("/api/auth/organization/invite-member", outsider.cookie, {
      organizationId: schoolId,
      email: "x@example.com",
      role: "member"
    })
  ).status === 403
);

// 2 seats: the owner plus one pending invitation fills them.
const overflow = await call(
  "/api/auth/organization/invite-member",
  head.cookie,
  {
    organizationId: schoolId,
    email: "third@example.com",
    role: "member"
  }
);
pass(
  "pending invitations count against seats",
  overflow.status === 402,
  `${overflow.status} — owner + 1 invited = 2 of 2`
);

console.log("\nJOINING");
pass(
  "join page renders for the invitee",
  (
    await fetch(`${BASE}/school/join?invitation=${invitation.id}`, {
      headers: { Cookie: teacher.cookie }
    })
  ).status === 200
);
pass(
  "a bogus invitation 404s",
  (
    await fetch(
      `${BASE}/school/join?invitation=00000000-0000-0000-0000-000000000000`,
      { headers: { Cookie: teacher.cookie } }
    )
  ).status === 404
);

pass(
  "somebody else cannot accept another teacher's invitation",
  (
    await call("/api/auth/organization/accept-invitation", outsider.cookie, {
      invitationId: invitation.id
    })
  ).status !== 200
);

const joined = await call(
  "/api/auth/organization/accept-invitation",
  teacher.cookie,
  { invitationId: invitation.id }
);
pass("teacher joins", joined.status === 200, `${joined.status}`);
pass(
  "teacher is a member",
  (
    await sql(
      `SELECT count(*)::int n FROM neon_auth.member WHERE "organizationId"=$1`,
      [schoolId]
    )
  )[0].n === 2
);

console.log("\nSHARED BANK");
const mk = (cookie, statement, isPublic = false) =>
  call("/api/questions", cookie, {
    level: "b2",
    part: "1",
    statement,
    themes: ["hobbies"],
    public: isPublic
  });
const q = await readJson(await mk(head.cookie, "School private question"));
pass(
  "question created by the head",
  Boolean(q.id),
  JSON.stringify(q).slice(0, 120)
);
pass(
  "it is owned by the school",
  (
    await sql(`SELECT organization_id FROM content.questions WHERE id=$1`, [
      q.id
    ])
  )[0]?.organization_id === schoolId
);

const readBy = async (cookie, id) =>
  (await fetch(`${BASE}/api/questions/${id}`, { headers: { Cookie: cookie } }))
    .status;
pass("a colleague can read it", (await readBy(teacher.cookie, q.id)) === 200);
pass("an outsider cannot", (await readBy(outsider.cookie, q.id)) === 404);

const edited = await call(
  `/api/questions/${q.id}`,
  teacher.cookie,
  { statement: "Edited by a colleague" },
  "PATCH"
);
pass("a colleague can edit it", edited.status === 200, `${edited.status}`);
pass(
  "an outsider cannot edit it",
  (
    await call(
      `/api/questions/${q.id}`,
      outsider.cookie,
      { statement: "nope" },
      "PATCH"
    )
  ).status === 404
);

console.log("\nACADEMY LIFTS THE EXAM LIMIT");
const qs = async (part) =>
  await readJson(
    await fetch(`${BASE}/api/questions?level=b2&part=${part}`, {
      headers: { Cookie: teacher.cookie }
    })
  );
const [p1, p2, p3, p4] = await Promise.all([1, 2, 3, 4].map(qs));
const slots = [
  { part: "1", candidate: "-", question_id: p1[0].id },
  { part: "2", candidate: "A", question_id: p2[0].id },
  { part: "2", candidate: "B", question_id: p2[1].id },
  { part: "3", candidate: "-", question_id: p3[0].id },
  { part: "4", candidate: "-", question_id: p4[0].id }
];
const exam = (title) =>
  call("/api/exams", teacher.cookie, { level: "b2", title, slots });
const e1 = await exam("School exam one");
const e2 = await exam("School exam two");
pass(
  "teacher gets unlimited exams through the school",
  e1.status === 201 && e2.status === 201,
  `${e1.status}/${e2.status} — free caps at 1`
);

console.log("\nCLEANUP");
for (const u of [head, teacher, outsider]) {
  await sql(`DELETE FROM neon_auth."user" WHERE id=$1`, [u.userId]);
}
await sql(`DELETE FROM neon_auth.organization WHERE id=$1`, [schoolId]);
const [left] = await sql(
  `SELECT (SELECT count(*)::int FROM content.questions WHERE organization_id=$1) q,
          (SELECT count(*)::int FROM content.subscriptions WHERE organization_id=$1) s`,
  [schoolId]
);
pass(
  "school and its rows removed",
  left.q === 0 && left.s === 0,
  JSON.stringify(left)
);

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
