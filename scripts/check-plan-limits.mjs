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

console.log("\nFREE PLAN LIMIT (1 exam)");
const first = await api("/api/exams", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    title: "My first mock",
    slots: fullSlots
  })
});
pass("first exam created", first.status === 201, `id=${first.body.id}`);

const second = await api("/api/exams", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    title: "My second mock",
    slots: fullSlots
  })
});
pass(
  "second exam refused with 402",
  second.status === 402,
  JSON.stringify(second.body)
);
pass(
  "402 says which resource and limit",
  second.body.resource === "exams" &&
    second.body.limit === 1 &&
    second.body.plan === "free"
);

console.log("\nAFTER DELETING, ROOM AGAIN");
pass(
  "delete own exam",
  (await api(`/api/exams/${first.body.id}`, { method: "DELETE" })).status ===
    200
);
const third = await api("/api/exams", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    title: "Replacement mock",
    slots: fullSlots
  })
});
pass("can create again once under the limit", third.status === 201);

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

await api(`/api/exams/${third.body.id}`, { method: "DELETE" });
// The account goes too, and its exams with it, rather than being left behind.
await sql(`DELETE FROM neon_auth."user" WHERE id = $1`, [me]);
console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
