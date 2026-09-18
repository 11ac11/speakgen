// Exercises the question routes end to end against the running dev server,
// as a real signed-in user.
import { signUpTestUser } from "./lib/testAuth.mjs";

const BASE = "http://localhost:3001";

const email = `routetest+${Date.now()}@example.com`;

function pass(name, ok, detail = "") {
  console.log(
    `${ok ? "  ok  " : "  FAIL"} ${name}${detail ? "  " + detail : ""}`
  );
  if (!ok) process.exitCode = 1;
}

async function api(path, init = {}) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.anon ? {} : { Cookie: cookie }),
      ...(init.headers || {})
    }
  });
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 80);
  }
  return { status: res.status, body };
}

// sign up and capture the session cookies
const { userId: me, cookie } = await signUpTestUser(BASE, "routetest");
console.log(`signed in as ${me}\n`);

console.log("CREATE");
const p1 = await api("/api/questions", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    part: "1",
    statement: "Route test: what do you enjoy about studying?",
    themes: ["work_education", "hobbies"],
    public: false
  })
});
pass("part 1 created", p1.status === 201, `id=${p1.body.id}`);
pass(
  "themes round-tripped",
  JSON.stringify(p1.body.themes) === '["hobbies","work_education"]',
  JSON.stringify(p1.body.themes)
);
pass("private by default", p1.body.public === false);
pass("owner is the session user", p1.body.owner_id === me);

const p2 = await api("/api/questions", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    part: "2",
    statement: "Route test: compare these two photographs.",
    themes: ["nature"],
    public: true,
    image_ids: [2325447, 158063],
    instructions: ["Look at the pictures.", "Now compare them."]
  })
});
pass(
  "part 2 created with images",
  p2.status === 201,
  JSON.stringify(p2.body.image_ids)
);

const p3 = await api("/api/questions", {
  method: "POST",
  body: JSON.stringify({
    level: "b2",
    part: "3",
    statement: "Route test: talk about these options together.",
    themes: ["daily_life"],
    public: true,
    prompts: ["one", "two", "three", "four", "five"]
  })
});
pass(
  "part 3 created with prompts",
  p3.status === 201,
  `${p3.body.prompts?.length} prompts`
);

console.log("\nREAD");
pass(
  "owner reads own private question",
  (await api(`/api/questions/${p1.body.id}`)).status === 200
);
pass(
  "anonymous cannot",
  (await api(`/api/questions/${p1.body.id}`, { anon: true })).status === 404
);
pass(
  "anonymous reads a public one",
  (await api(`/api/questions/${p2.body.id}`, { anon: true })).status === 200
);

console.log("\nUPDATE");
const patched = await api(`/api/questions/${p1.body.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    statement: "Route test: updated",
    themes: ["hobbies", "nature"],
    public: true
  })
});
pass(
  "patch applied",
  patched.status === 200 && patched.body.statement === "Route test: updated"
);
pass(
  "themes synced",
  JSON.stringify(patched.body.themes) === '["hobbies","nature"]',
  JSON.stringify(patched.body.themes)
);
pass(
  "now visible anonymously",
  (await api(`/api/questions/${p1.body.id}`, { anon: true })).status === 200
);

console.log("\nDASHBOARD LISTS");
const all = await api(`/api/u/${me}/questions/all`);
pass(
  "all: 3 rows",
  all.status === 200 && all.body.length === 3,
  `${all.body.length} rows`
);
pass(
  "all: rows carry level and part",
  all.body.every((r) => r.level && r.part)
);
const byLevel = await api(`/api/u/${me}/questions/b2`);
pass("by level: 3 rows", byLevel.body.length === 3, `${byLevel.body.length}`);
const byPart = await api(`/api/u/${me}/questions/b2/2`);
pass("by level+part: 1 row", byPart.body.length === 1, `${byPart.body.length}`);
pass(
  "house content excluded from my list",
  all.body.every((r) => r.owner_id === me)
);

console.log("\nAUTHORISATION");
pass(
  "cannot list another user's questions",
  (await api("/api/u/c90288b8-8694-47e4-9b3c-4b61f8f935b9/questions/all"))
    .status === 403
);
pass(
  "anonymous cannot create",
  (
    await api("/api/questions", {
      method: "POST",
      anon: true,
      body: JSON.stringify({
        level: "b2",
        part: "1",
        statement: "x",
        themes: ["nature"],
        public: true
      })
    })
  ).status === 401
);

console.log("\nVALIDATION");
const post = (body) =>
  api("/api/questions", { method: "POST", body: JSON.stringify(body) });
const base = { level: "b2", part: "1", statement: "x", public: true };

pass(
  "bad theme slug rejected",
  (await post({ ...base, themes: ["not_a_theme"] })).status === 400
);
pass("missing themes rejected", (await post({ ...base })).status === 400);
pass(
  "missing level rejected",
  (await post({ part: "1", statement: "x", themes: ["nature"], public: true }))
    .status === 400
);
pass(
  "invalid part rejected",
  (await post({ ...base, part: "9", themes: ["nature"] })).status === 400
);
pass(
  "C2 part 4 rejected (level has 3 parts)",
  (await post({ ...base, level: "c2", part: "4", themes: ["nature"] }))
    .status === 400
);
pass("list needs level and part", (await api("/api/questions")).status === 400);
pass(
  "list by level and part",
  (await api("/api/questions?level=b2&part=1")).body.length > 0
);

console.log("\nDELETE");
pass(
  "delete own",
  (await api(`/api/questions/${p1.body.id}`, { method: "DELETE" })).status ===
    200
);
pass(
  "gone afterwards",
  (await api(`/api/questions/${p1.body.id}`)).status === 404
);
pass(
  "cannot delete house content",
  (await api("/api/questions/1", { method: "DELETE" })).status === 404
);
console.log("\nPAGES");
for (const [name, path, expect] of [
  ["edit page", `/b2/questions/${p2.body.id}`, 200],
  ["new question page", "/questions/new", 200],
  ["random runner", "/b2/questions/random/1", 200],
  ["random runner part 3", "/b2/questions/random/3", 200],
  ["random runner, c1", "/c1/questions/random/2", 200],
  ["random runner, bad part", "/b2/questions/random/9", 404],
  ["random runner, disabled level", "/c2/questions/random/1", 404],
  ["edit page, missing id", "/b2/questions/99999", 404],
  ["edit page, non-numeric id", "/b2/questions/abc", 404],
  ["edit page, unknown level", "/nope/questions/1", 404]
]) {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
  pass(name, res.status === expect, `${res.status}`);
}

console.log("\nREDIRECTS FROM OLD PATHS");
for (const [from, to, status] of [
  [`/question/b2/2/${p2.body.id}`, `/b2/questions/${p2.body.id}`, 308],
  ["/question/new", "/questions/new", 308],
  ["/show-question/b2/1", "/b2/questions/random/1", 308],
  ["/show-question/c1/3", "/c1/questions/random/3", 308],
  // Not permanent: a default entry point rather than a moved resource.
  ["/b2/questions/random", "/b2/questions/random/1", 307],
  ["/c1/questions/random", "/c1/questions/random/1", 307]
]) {
  const res = await fetch(BASE + from, {
    redirect: "manual",
    headers: { Cookie: cookie }
  });
  const location = (res.headers.get("location") || "").replace(BASE, "");
  pass(
    `${from} -> ${to}`,
    res.status === status && location === to,
    `${res.status} ${location}`
  );
}

console.log("\nMALFORMED PARTS ARE REFUSED, NOT SWALLOWED");
// These used to hit the CHECK constraints and come back as a 500, which the
// form treated as success and navigated away from, losing the question.
{
  const noPrompts = await api("/api/questions", {
    method: "POST",
    body: JSON.stringify({
      level: "b2",
      part: "3",
      statement: "Route test: part 3 with no prompts.",
      themes: ["daily_life"],
      public: true
    })
  });
  pass(
    "part 3 without prompts is a named 400",
    noPrompts.status === 400 && /prompts/i.test(noPrompts.body?.error ?? ""),
    `${noPrompts.status} ${noPrompts.body?.error}`
  );

  const oneImage = await api("/api/questions", {
    method: "POST",
    body: JSON.stringify({
      level: "b2",
      part: "2",
      statement: "Route test: part 2 with one photograph.",
      themes: ["nature"],
      public: true,
      image_ids: [2325447]
    })
  });
  pass(
    "part 2 with one photograph is a named 400",
    oneImage.status === 400 && /photograph/i.test(oneImage.body?.error ?? ""),
    `${oneImage.status} ${oneImage.body?.error}`
  );

  // The update route carries no part, so its schema cannot check this. The
  // constraint handler in lib/questions is what keeps it off 500.
  const stripped = await api(`/api/questions/${p3.body.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      statement: "Route test: talk about these options together.",
      themes: ["daily_life"],
      public: true,
      prompts: ["only one"]
    })
  });
  pass(
    "patching a part 3 down to one prompt is a named 400",
    stripped.status === 400 && /prompts/i.test(stripped.body?.error ?? ""),
    `${stripped.status} ${stripped.body?.error}`
  );
}

console.log("\nWRONG LEVEL IN PATH");
{
  const res = await fetch(`${BASE}/c1/questions/${p2.body.id}`, {
    redirect: "manual",
    headers: { Cookie: cookie }
  });
  const location = (res.headers.get("location") || "").replace(BASE, "");
  pass(
    "b2 question under /c1 redirects to canonical",
    [307, 308].includes(res.status) &&
      location === `/b2/questions/${p2.body.id}`,
    `${res.status} ${location}`
  );
}

// clean up
console.log("\ncleanup");
for (const q of [p2, p3]) {
  await api(`/api/questions/b2/${q.body.part}/${q.body.id}`, {
    method: "DELETE"
  });
}
console.log(`  soft-deleted test questions; user ${me} left in place`);
