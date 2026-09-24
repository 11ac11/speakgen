// The admin metrics page and the usage counters behind it: only admins see the
// page, everyone else gets a 404, and PDF exports and share-link views are
// counted without recording who.
//
// The admin checks sign in as metrics-probe@example.com, so the dev server has
// to be started with that address in ADMIN_EMAILS, e.g.
//   ADMIN_EMAILS="crump.uk@gmail.com,metrics-probe@example.com" npm run dev
// Without it those checks are skipped, and say so, rather than failing.
import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";
import { signUpTestUser } from "./lib/testAuth.mjs";

const BASE = process.env.CHECK_BASE ?? "http://localhost:3001";
const sql = neon(process.env.DATABASE_URL);
const PROBE = "metrics-probe@example.com";
let failed = 0;
const pass = (n, ok, d = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${n}${d ? "  " + d : ""}`);
  if (!ok) failed++;
};
const page = async (path, cookie) => {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie ?? "" } });
  return { status: res.status, html: await res.text() };
};
const count = async (kind, column, id) =>
  (
    await sql(
      `SELECT count(*)::int n FROM content.usage_events WHERE kind = $1 AND ${column} = $2`,
      [kind, id]
    )
  )[0].n;

// A fixed address, so it can be listed in ADMIN_EMAILS; any leftover from an
// earlier run goes first.
await sql(`DELETE FROM neon_auth."user" WHERE email = $1`, [PROBE]);
const signUp = await fetch(`${BASE}/api/auth/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: PROBE,
    password: "TestPassw0rd!23",
    name: "Metrics Probe"
  })
});
const probe = {
  userId: (await signUp.json())?.user?.id,
  cookie: signUp.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ")
};
const teacher = await signUpTestUser(BASE, "metrics-teacher");

try {
  console.log("WHO SEES IT");
  pass("signed out: a 404", (await page("/admin")).status === 404);
  pass(
    "an ordinary teacher: a 404",
    (await page("/admin", teacher.cookie)).status === 404
  );
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  pass("kept out of search", robots.includes("Disallow: /admin"));

  const admin = await page("/admin", probe.cookie);
  const configured = admin.status === 200;
  if (!configured) {
    console.log(
      `  skip admin checks: ${PROBE} is not in the server's ADMIN_EMAILS`
    );
  } else {
    pass(
      "an admin sees the metrics",
      admin.html.includes("Metrics") && admin.html.includes("Week by week"),
      `${admin.status}`
    );
    pass(
      "and it is not indexed",
      /<meta name="robots" content="noindex/.test(admin.html)
    );
  }

  console.log("\nCOUNTING");
  // An exam of the teacher's, shared, then opened signed out.
  const byPart = {};
  for (const part of ["1", "2", "3", "4"]) {
    byPart[part] = await (
      await fetch(`${BASE}/api/questions?level=b2&part=${part}`, {
        headers: { Cookie: teacher.cookie }
      })
    ).json();
  }
  const slots = [
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
  const post = (path, body) =>
    fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: teacher.cookie },
      body: JSON.stringify(body)
    }).then((r) => r.json());
  const exam = await post("/api/exams", {
    level: "b2",
    title: "Metrics exam",
    slots
  });
  const link = await post(`/api/share-links?kind=exam&id=${exam.id}`, {});

  const viewsBefore = await count("share_view", "exam_id", exam.id);
  await page(link.path);
  await page(link.path);
  pass(
    "each share-link view is counted",
    (await count("share_view", "exam_id", exam.id)) === viewsBefore + 2
  );

  await sql(
    `INSERT INTO content.user_profiles (user_id, plan) VALUES ($1, 'pro')
     ON CONFLICT (user_id) DO UPDATE SET plan = 'pro'`,
    [teacher.userId]
  );
  const pdfsBefore = await count("pdf_export", "exam_id", exam.id);
  const pdf = await fetch(`${BASE}/api/exams/${exam.id}/pdf`, {
    headers: { Cookie: teacher.cookie }
  });
  await pdf.arrayBuffer();
  pass(
    "a PDF export is counted",
    pdf.status === 200 &&
      (await count("pdf_export", "exam_id", exam.id)) === pdfsBefore + 1
  );

  const columns = (
    await sql(
      `SELECT string_agg(column_name, ',' ORDER BY ordinal_position) c
         FROM information_schema.columns
        WHERE table_schema = 'content' AND table_name = 'usage_events'`
    )
  )[0].c;
  pass(
    "and nothing about who",
    !/user|ip|session|email/.test(columns),
    columns
  );

  if (configured) {
    const after = await page("/admin", probe.cookie);
    pass(
      "the admin page shows the share link among the most viewed",
      after.html.includes("Metrics exam")
    );
  }
} catch (error) {
  pass("suite ran to the end", false, error.message);
} finally {
  console.log("\nCLEANUP");
  await sql(
    `DELETE FROM content.usage_events WHERE exam_id IN (SELECT id FROM content.exams WHERE owner_id = $1)`,
    [teacher.userId]
  );
  for (const id of [teacher.userId, probe.userId].filter(Boolean)) {
    await sql(`DELETE FROM content.exams WHERE owner_id = $1`, [id]);
    await sql(`DELETE FROM neon_auth."user" WHERE id = $1`, [id]);
  }
  pass(
    "test accounts removed",
    (
      await sql(
        `SELECT count(*)::int n FROM neon_auth."user" WHERE email = $1`,
        [PROBE]
      )
    )[0].n === 0
  );
}

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
