// Share links, PDF export and school branding, end to end: who can share,
// what a link opens and stops opening, who may export, and what a school's
// students see.
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
const page = async (path, cookie) => {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie ?? "" } });
  return { status: res.status, html: await res.text() };
};

const teacher = await signUpTestUser(BASE, "share-teacher");
const outsider = await signUpTestUser(BASE, "share-outsider");
const head = await signUpTestUser(BASE, "brand-head");
let schoolId = null;
const tokens = [];

try {
  // An exam of the teacher's own, built from the first question of each slot.
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
  const examTitle = `Shared exam ${Date.now()}`;
  const created = await readJson(
    await call("/api/exams", teacher.cookie, {
      level: "b2",
      title: examTitle,
      slots
    })
  );
  const examId = created?.id;
  if (!examId) throw new Error(`no exam: ${JSON.stringify(created)}`);

  console.log("SHARING AN EXAM");
  const q = `?kind=exam&id=${examId}`;
  const none = await readJson(
    await call(`/api/share-links${q}`, teacher.cookie, null, "GET")
  );
  pass("no link to begin with", none.token === null, JSON.stringify(none));

  pass(
    "anonymous cannot share",
    (await call(`/api/share-links${q}`, null)).status === 401
  );
  pass(
    "an outsider cannot share it",
    (await call(`/api/share-links${q}`, outsider.cookie)).status === 404
  );

  const first = await readJson(
    await call(`/api/share-links${q}`, teacher.cookie)
  );
  const again = await readJson(
    await call(`/api/share-links${q}`, teacher.cookie)
  );
  tokens.push(first.token);
  pass("the author can share it", /^[\w-]{22}$/.test(first.token ?? ""));
  pass("sharing twice gives one link", first.token === again.token);

  const shared = await page(first.path);
  pass(
    "the link opens the exam signed out",
    shared.status === 200 && shared.html.includes(examTitle),
    `${shared.status}`
  );
  pass(
    "the shared page is kept out of search",
    /<meta name="robots" content="noindex, nofollow"/.test(shared.html)
  );
  pass(
    "the exam itself is still private",
    (await page(`/b2/exams/${examId}`)).status === 404
  );
  pass(
    "a made-up token is a 404",
    (await page("/share/AAAAAAAAAAAAAAAAAAAAAA")).status === 404
  );

  const houseExam = (
    await sql`SELECT id::int AS id FROM content.exams WHERE owner_id IS NULL LIMIT 1`
  )[0];
  pass(
    "house exams are not shareable",
    (
      await call(
        `/api/share-links?kind=exam&id=${houseExam.id}`,
        teacher.cookie
      )
    ).status === 404
  );

  const revoked = await call(
    `/api/share-links${q}`,
    teacher.cookie,
    null,
    "DELETE"
  );
  pass("the author can stop sharing", revoked.status === 200);
  pass("a revoked link is a 404", (await page(first.path)).status === 404);
  const fresh = await readJson(
    await call(`/api/share-links${q}`, teacher.cookie)
  );
  tokens.push(fresh.token);
  pass(
    "sharing again makes a new link",
    fresh.token && fresh.token !== first.token
  );

  console.log("\nSHARING A PRACTICE DRAWS FROM THE TEACHER'S POOL");
  // C1 Part 3 on sports has no public questions, so the only thing a shared
  // practice on it can draw is the teacher's private one.
  const secret = `Private sports question ${Date.now()}`;
  const [privateQ] = await sql(
    `INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts)
     VALUES ('c1', 3, $1, 'private', $2, ARRAY['one','two','three'])
     RETURNING id::int AS id`,
    [teacher.userId, secret]
  );
  await sql(
    `INSERT INTO content.question_themes (question_id, theme_slug) VALUES ($1, 'sports')`,
    [privateQ.id]
  );
  const practice = await readJson(
    await call("/api/practices", teacher.cookie, {
      level: "c1",
      title: "Shared sports practice",
      part: "3",
      themes: ["sports"],
      question_count: 1
    })
  );
  pass("practice created", Boolean(practice?.id), JSON.stringify(practice));
  const practiceLink = await readJson(
    await call(
      `/api/share-links?kind=practice&id=${practice.id}`,
      teacher.cookie
    )
  );
  tokens.push(practiceLink.token);
  const sharedPractice = await page(practiceLink.path);
  pass(
    "a student following the link gets the private question",
    sharedPractice.status === 200 && sharedPractice.html.includes(secret),
    `${sharedPractice.status}`
  );
  pass(
    "the private question is not readable signed out otherwise",
    (await page(`/c1/questions/${privateQ.id}`)).status === 404
  );

  console.log("\nPDF EXPORT");
  pass(
    "signed out cannot export",
    (await page(`/api/exams/${examId}/pdf`)).status === 401
  );
  const freePdf = await fetch(`${BASE}/api/exams/${examId}/pdf`, {
    headers: { Cookie: teacher.cookie }
  });
  pass("the free plan is asked to upgrade", freePdf.status === 402);

  await sql(
    `UPDATE content.user_profiles SET plan = 'pro' WHERE user_id = $1`,
    [teacher.userId]
  );
  const proPdf = await fetch(`${BASE}/api/exams/${examId}/pdf`, {
    headers: { Cookie: teacher.cookie }
  });
  const bytes = Buffer.from(await proPdf.arrayBuffer());
  pass(
    "Pro downloads a PDF of the exam",
    proPdf.status === 200 &&
      proPdf.headers.get("content-type") === "application/pdf" &&
      bytes.subarray(0, 5).toString() === "%PDF-",
    `${proPdf.status} ${bytes.length} bytes`
  );
  const practicePdf = await fetch(`${BASE}/api/practices/${practice.id}/pdf`, {
    headers: { Cookie: teacher.cookie }
  });
  pass("Pro downloads a PDF of a practice", practicePdf.status === 200);
  pass(
    "Pro can export a house exam",
    (
      await fetch(`${BASE}/api/exams/${houseExam.id}/pdf`, {
        headers: { Cookie: teacher.cookie }
      })
    ).status === 200
  );
  pass(
    "a free outsider is asked to upgrade before anything is looked up",
    (
      await fetch(`${BASE}/api/exams/${examId}/pdf`, {
        headers: { Cookie: outsider.cookie }
      })
    ).status === 402
  );
  await sql(
    `UPDATE content.user_profiles SET plan = 'pro' WHERE user_id = $1`,
    [outsider.userId]
  );
  pass(
    "Pro cannot export somebody else's exam",
    (
      await fetch(`${BASE}/api/exams/${examId}/pdf`, {
        headers: { Cookie: outsider.cookie }
      })
    ).status === 404
  );

  console.log("\nSCHOOL BRANDING");
  const school = await readJson(
    await call("/api/auth/organization/create", head.cookie, {
      name: "Branding Test Academy",
      slug: `branding-test-${Date.now().toString(36)}`
    })
  );
  schoolId = school?.id;
  pass("school created", Boolean(schoolId));

  const brand = (cookie, body) =>
    call("/api/branding", cookie, { organizationId: schoolId, ...body }, "PUT");

  pass(
    "branding needs Academy",
    (await brand(head.cookie, { displayName: "X", accentColor: "" })).status ===
      402
  );
  await sql(
    `INSERT INTO content.subscriptions
       (organization_id, plan, status, billing_interval, seats, provider, provider_subscription_id)
     VALUES ($1,'academy','active','month',5,'stripe',$2)`,
    [schoolId, `sub_brand_${Date.now()}`]
  );
  pass(
    "a non-member cannot brand the school",
    (await brand(outsider.cookie, { displayName: "X", accentColor: "" }))
      .status === 403
  );
  pass(
    "a colour too light for white text is refused",
    (await brand(head.cookie, { displayName: "", accentColor: "#ffee58" }))
      .status === 400
  );
  const saved = await brand(head.cookie, {
    displayName: "St Brand's Academy",
    accentColor: "#0B3D91"
  });
  pass("the owner saves name and colour", saved.status === 200);
  const [row] = await sql(
    `SELECT display_name, accent_color FROM content.organization_branding WHERE organization_id = $1`,
    [schoolId]
  );
  pass(
    "stored normalised",
    row?.accent_color === "#0b3d91" &&
      row?.display_name === "St Brand's Academy",
    JSON.stringify(row)
  );

  const form = new FormData();
  form.set("organizationId", schoolId);
  form.set(
    "file",
    new Blob([Buffer.from("not an image at all")], { type: "image/png" }),
    "logo.png"
  );
  const logo = await fetch(`${BASE}/api/branding/logo`, {
    method: "POST",
    headers: { Cookie: head.cookie },
    body: form
  });
  pass("a file that is not an image is refused", logo.status === 415);

  // A real 1x1 PNG. Without LOGO_STORAGE the server has nowhere to put it and
  // says so; with LOGO_STORAGE=inline it is stored as a data: URL.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  const realForm = new FormData();
  realForm.set("organizationId", schoolId);
  realForm.set("file", new Blob([png], { type: "image/png" }), "logo.png");
  const realLogo = await fetch(`${BASE}/api/branding/logo`, {
    method: "POST",
    headers: { Cookie: head.cookie },
    body: realForm
  });
  const realBody = await readJson(realLogo);
  pass(
    "a real logo is stored, or refused as storage not configured",
    (realLogo.status === 200 && realBody.logoUrl) ||
      (realLogo.status === 503 && realBody.reason === "storage_unavailable"),
    `${realLogo.status} ${realBody.reason ?? ""}`
  );

  // The school's own exam, shared: its students see the school.
  const schoolExam = await readJson(
    await call("/api/exams", head.cookie, {
      level: "b2",
      title: "School shared exam",
      slots
    })
  );
  const schoolLink = await readJson(
    await call(`/api/share-links?kind=exam&id=${schoolExam.id}`, head.cookie)
  );
  tokens.push(schoolLink.token);
  const branded = await page(schoolLink.path);
  pass(
    "a school's shared exam wears its name and colour",
    branded.status === 200 &&
      branded.html.includes("St Brand&#x27;s Academy") &&
      branded.html.includes("#0b3d91"),
    `${branded.status}`
  );
  pass(
    "a teacher's own shared exam is unbranded",
    !(await page(fresh.path)).html.includes("St Brand")
  );
  pass(
    "settings shows the branding panel to the owner",
    (await page("/settings", head.cookie)).html.includes("School branding")
  );
  const schoolPdf = await fetch(`${BASE}/api/exams/${schoolExam.id}/pdf`, {
    headers: { Cookie: head.cookie }
  });
  pass("Academy downloads a branded PDF", schoolPdf.status === 200);

  await sql(
    `UPDATE content.subscriptions SET status = 'canceled' WHERE organization_id = $1`,
    [schoolId]
  );
  pass(
    "branding disappears when the subscription lapses",
    !(await page(schoolLink.path)).html.includes("St Brand")
  );
} catch (error) {
  pass("suite ran to the end", false, error.message);
} finally {
  console.log("\nCLEANUP");
  for (const u of [teacher, outsider, head]) {
    await sql(`DELETE FROM content.questions WHERE owner_id=$1`, [u.userId]);
    await sql(`DELETE FROM neon_auth."user" WHERE id=$1`, [u.userId]);
  }
  if (schoolId) {
    await sql(`DELETE FROM neon_auth.organization WHERE id=$1`, [schoolId]);
  }
  // Links go with the exams and practices they open, which go with their
  // authors.
  const [left] = await sql(
    `SELECT count(*)::int n FROM content.share_links WHERE token = ANY($1::text[])`,
    [tokens]
  );
  pass("links removed with their content", left.n === 0, JSON.stringify(left));
}

console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
