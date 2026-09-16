// Exercises the question routes end to end against the running dev server,
// as a real signed-in user.
const BASE = "http://localhost:3001";

const email = `routetest+${Date.now()}@example.com`;
let cookie = "";

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
const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    password: "TestPassw0rd!23",
    name: "Route Test"
  })
});
cookie = signup.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
const me = (await signup.json()).user.id;
console.log(`signed in as ${me}\n`);

console.log("CREATE");
const p1 = await api("/api/questions/b2/1", {
  method: "POST",
  body: JSON.stringify({
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

const p2 = await api("/api/questions/b2/2", {
  method: "POST",
  body: JSON.stringify({
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

const p3 = await api("/api/questions/b2/3", {
  method: "POST",
  body: JSON.stringify({
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
  (await api(`/api/questions/b2/1/${p1.body.id}`)).status === 200
);
pass(
  "anonymous cannot",
  (await api(`/api/questions/b2/1/${p1.body.id}`, { anon: true })).status ===
    404
);
pass(
  "anonymous reads a public one",
  (await api(`/api/questions/b2/2/${p2.body.id}`, { anon: true })).status ===
    200
);

console.log("\nUPDATE");
const patched = await api(`/api/questions/b2/1/${p1.body.id}`, {
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
  (await api(`/api/questions/b2/1/${p1.body.id}`, { anon: true })).status ===
    200
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
    await api("/api/questions/b2/1", {
      method: "POST",
      anon: true,
      body: JSON.stringify({ statement: "x", themes: ["nature"], public: true })
    })
  ).status === 401
);

console.log("\nVALIDATION");
pass(
  "bad theme slug rejected",
  (
    await api("/api/questions/b2/1", {
      method: "POST",
      body: JSON.stringify({
        statement: "x",
        themes: ["not_a_theme"],
        public: true
      })
    })
  ).status === 400
);
pass(
  "missing themes rejected",
  (
    await api("/api/questions/b2/1", {
      method: "POST",
      body: JSON.stringify({ statement: "x", public: true })
    })
  ).status === 400
);
pass(
  "invalid part rejected",
  (
    await api("/api/questions/b2/9", {
      method: "POST",
      body: JSON.stringify({ statement: "x", themes: ["nature"], public: true })
    })
  ).status === 400
);
pass(
  "C2 part 4 rejected (level has 3 parts)",
  (
    await api("/api/questions/c2/4", {
      method: "POST",
      body: JSON.stringify({ statement: "x", themes: ["nature"], public: true })
    })
  ).status === 400
);

console.log("\nDELETE");
pass(
  "delete own",
  (await api(`/api/questions/b2/1/${p1.body.id}`, { method: "DELETE" }))
    .status === 200
);
pass(
  "gone afterwards",
  (await api(`/api/questions/b2/1/${p1.body.id}`)).status === 404
);
pass(
  "cannot delete house content",
  (await api("/api/questions/b2/1/1", { method: "DELETE" })).status === 404
);

console.log("\nPAGES");
for (const [name, path] of [
  ["edit page", `/question/b2/2/${p2.body.id}`],
  ["show-question", "/show-question/b2/1"],
  ["show-question part 3", "/show-question/b2/3"],
  ["show-question bad part", "/show-question/b2/9"],
  ["edit page, missing id", "/question/b2/1/99999"]
]) {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
  const expect = name.includes("bad") || name.includes("missing") ? 404 : 200;
  pass(name, res.status === expect, `${res.status}`);
}

// clean up
console.log("\ncleanup");
for (const q of [p2, p3]) {
  await api(`/api/questions/b2/${q.body.part}/${q.body.id}`, {
    method: "DELETE"
  });
}
console.log(`  soft-deleted test questions; user ${me} left in place`);
