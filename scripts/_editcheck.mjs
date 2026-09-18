import puppeteer from "puppeteer-core";
import { signUpTestUser } from "./lib/testAuth.mjs";
const BASE = "http://localhost:3001";
const u = await signUpTestUser(BASE, "editchk");
const made = await fetch(`${BASE}/api/questions`, { method: "POST", headers: { "Content-Type": "application/json", cookie: u.cookie },
  body: JSON.stringify({ level: "b2", part: "1", statement: "Edit read-only probe.", themes: ["hobbies"], public: true }) }).then((r) => r.json());
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.log("  PAGE ERROR:", e.message));
await p.setViewport({ width: 1180, height: 1300 });
await p.setCookie(...u.cookie.split("; ").map((c) => { const [n, ...r] = c.split("="); return { name: n, value: r.join("="), url: BASE, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }; }));
await p.goto(`${BASE}/b2/questions/${made.id}`, { waitUntil: "networkidle0" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

console.log("edit page dropdowns:", await p.evaluate(() => {
  const wrap = (label) => [...document.querySelectorAll("div")].find((d) => d.querySelector("label")?.textContent?.trim() === label && d.querySelector("input"));
  const level = wrap("Level").querySelector("input");
  const part = wrap("Part").querySelector("input");
  return { levelValue: level.value, levelDisabled: level.disabled, partValue: part.value, partDisabled: part.disabled };
}));
// Clicking a disabled dropdown must not open a list.
await p.evaluate(() => [...document.querySelectorAll("div")].find((d) => d.querySelector("label")?.textContent?.trim() === "Part" && d.querySelector("input")).querySelector("input").click());
await wait(400);
console.log("options opened after click:", await p.evaluate(() => document.querySelectorAll("li.dropdown-item").length));
console.log("hint shown:", await p.evaluate(() => [...document.querySelectorAll("p")].some((x) => x.textContent.includes("keeps the level and part"))));

// A new question must still have them enabled.
await p.goto(`${BASE}/questions/new`, { waitUntil: "networkidle0" });
console.log("new page dropdowns :", await p.evaluate(() => {
  const wrap = (label) => [...document.querySelectorAll("div")].find((d) => d.querySelector("label")?.textContent?.trim() === label && d.querySelector("input"));
  return { levelDisabled: wrap("Level").querySelector("input").disabled, partDisabled: wrap("Part").querySelector("input").disabled };
}));
await b.close();
