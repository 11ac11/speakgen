// Drives the exam write path as a real signed-in user and proves the free plan
// limit actually bites.
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

async function api(path, init = {}) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.anon ? {} : { Cookie: cookie }),
      ...(init.headers || {})
    }
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 120);
  }
  return { status: res.status, body };
}

const { userId: me, cookie } = await signUpTestUser(BASE, "plantest");
console.log(`signed in as ${me}\n`);

// house questions to build from
const pick = async (part) =>
  (await api(`/api/questions?level=b2&part=${part}`)).body;
const [p1, p2, p3, p4] = await Promise.all([1, 2, 3, 4].map(pick));

const fullSlots = [
  { part: "1", candidate: "-", question_id: p1[0].id },
  { part: "2", candidate: "A", question_id: p2[0].id },
  { part: "2", candidate: "B", question_id: p2[1].id },
  { part: "3", candidate: "-", question_id: p3[0].id },
  { part: "4", candidate: "-", question_id: p4[0].id }
];

console.log("VALIDATION");
pass(
  "anonymous cannot create an exam",
  (
    await api("/api/exams", {
      method: "POST",
      anon: true,
      body: JSON.stringify({ level: "b2", title: "x", slots: fullSlots })
    })
  ).status === 401
);

const incomplete = await api("/api/exams", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    title: "Missing part 4",
    slots: fullSlots.slice(0, 4)
  })
});
pass(
  "incomplete exam rejected",
  incomplete.status === 400,
  JSON.stringify(incomplete.body.missing ?? incomplete.body.error)
);

pass(
  "only one Part 2 rejected",
  (
    await api("/api/exams", {
      method: "POST",
      body: JSON.stringify({
        level: "b2",
        title: "One long turn",
        slots: fullSlots.filter((s) => s.candidate !== "B")
      })
    })
  ).status === 400
);

const wrongPart = await api("/api/exams", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    title: "Wrong part",
    slots: fullSlots.map((s) =>
      s.part === "3" ? { ...s, question_id: p1[0].id } : s
    )
  })
});
pass(
  "question from the wrong part rejected by the FK",
  wrongPart.status === 400,
  JSON.stringify(wrongPart.body.error)
);

const c1q = (await api("/api/questions?level=c1&part=1")).body;
pass(
  "C1 question in a B2 exam rejected",
  (
    await api("/api/exams", {
      method: "POST",
      body: JSON.stringify({
        level: "b2",
        title: "Mixed levels",
        slots: fullSlots.map((s) =>
          s.part === "1" ? { ...s, question_id: c1q[0].id } : s
        )
      })
    })
  ).status === 400
);

console.log("\nFREE PLAN LIMIT (2 exams)");
const create = (title) =>
  api("/api/exams", {
    method: "POST",
    body: JSON.stringify({ level: "b2", title, slots: fullSlots })
  });

const first = await create("My first mock");
pass("first exam created", first.status === 201, `id=${first.body.id}`);
const second = await create("My second mock");
pass("second exam created", second.status === 201, `id=${second.body.id}`);

const refused = await create("My third mock");
pass(
  "third exam refused with 402",
  refused.status === 402,
  JSON.stringify(refused.body)
);
pass(
  "402 says which resource and limit",
  refused.body.resource === "exams" &&
    refused.body.limit === 2 &&
    refused.body.plan === "free"
);
pass(
  "402 says the waitlist is open and they are not on it",
  refused.body.waitlist?.mode === true &&
    refused.body.waitlist?.joined === false,
  JSON.stringify(refused.body.waitlist)
);

console.log("\nWAITLIST");
pass(
  "unknown trigger rejected",
  (
    await api("/api/waitlist", {
      method: "POST",
      body: JSON.stringify({ plan: "pro", trigger: "made_up" })
    })
  ).status === 400
);
pass(
  "signed out without an email rejected",
  (
    await api("/api/waitlist", {
      method: "POST",
      anon: true,
      body: JSON.stringify({ plan: "pro", trigger: "pricing_page" })
    })
  ).status === 400
);
const anonJoin = await api("/api/waitlist", {
  method: "POST",
  anon: true,
  body: JSON.stringify({
    plan: "pro",
    trigger: "pricing_page",
    email: `${me}@example.com`
  })
});
pass(
  "signed out joins by email, with no bonus",
  anonJoin.status === 200 && anonJoin.body.bonus === 0,
  JSON.stringify(anonJoin.body)
);

const join = await api("/api/waitlist", {
  method: "POST",
  body: JSON.stringify({
    plan: "pro",
    trigger: "exam_limit",
    note: "check suite",
    newsConsent: false
  })
});
pass(
  "signed in joins and earns one exam",
  join.status === 200 && join.body.bonus === 1,
  JSON.stringify(join.body)
);
const [row] = await sql(
  `SELECT trigger, user_id FROM content.waitlist WHERE user_id = $1`,
  [me]
);
pass("trigger stored from the button", row?.trigger === "exam_limit");

const again = await api("/api/waitlist", {
  method: "POST",
  body: JSON.stringify({
    plan: "academy",
    trigger: "seats",
    schoolName: "Check School",
    teacherCount: 4
  })
});
pass(
  "a second list earns no second exam",
  again.status === 200 && again.body.bonus === 0,
  JSON.stringify(again.body)
);

const third = await create("Bonus mock");
pass("third exam allowed after joining", third.status === 201);
const fourth = await create("One too many");
pass(
  "fourth exam refused, limit now 3, joined",
  fourth.status === 402 &&
    fourth.body.limit === 3 &&
    fourth.body.waitlist?.joined === true,
  JSON.stringify(fourth.body)
);

console.log("\nAFTER DELETING, ROOM AGAIN");
pass(
  "delete own exam",
  (await api(`/api/exams/${first.body.id}`, { method: "DELETE" })).status ===
    200
);
const replacement = await create("Replacement mock");
pass("can create again once under the limit", replacement.status === 201);

console.log("\nOWNERSHIP");
pass(
  "cannot delete a house exam",
  (await api("/api/exams/1", { method: "DELETE" })).status === 404
);
pass(
  "house exams still listed",
  (await api("/api/exams?level=b2")).body.length >= 3
);

console.log("\nPAGES");
for (const [name, path, expect] of [
  ["builder", "/b2/exams/new", 200],
  ["pricing", "/pricing", 200],
  ["exam list", "/b2/exams", 200]
]) {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
  pass(name, res.status === expect, `${res.status}`);
}

// Deleting the user takes their exams and signed-in waitlist rows with it;
// the signed-out row is keyed by email alone.
await sql(`DELETE FROM content.waitlist WHERE email = $1`, [
  `${me}@example.com`
]);
// The account goes too, and its exams with it, rather than being left behind.
await sql(`DELETE FROM neon_auth."user" WHERE id = $1`, [me]);
console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
