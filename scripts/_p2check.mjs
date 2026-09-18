// Creates a B2 Part 2 through the form, end to end, photographs and all.
import puppeteer from "puppeteer-core";
import { signUpTestUser } from "./lib/testAuth.mjs";
const BASE = "http://localhost:3001";
const u = await signUpTestUser(BASE, "p2chk");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
const posts = [];
p.on("request", (r) => { if (r.method() === "POST" && r.url().includes("/api/questions")) posts.push(1); });
p.on("pageerror", (e) => console.log("  PAGE ERROR:", e.message));
await p.setViewport({ width: 1180, height: 1400 });
await p.setCookie(...u.cookie.split("; ").map((c) => { const [n, ...r] = c.split("="); return { name: n, value: r.join("="), url: BASE, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }; }));
await p.goto(`${BASE}/questions/new`, { waitUntil: "networkidle0" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = async (label, option) => {
  await p.evaluate((l) => [...document.querySelectorAll("div")].find((d) => d.querySelector("label")?.textContent?.trim() === l && d.querySelector("input")).querySelector("input").click(), label);
  await wait(250);
  await p.evaluate((o) => [...document.querySelectorAll("li.dropdown-item")].find((li) => li.textContent.trim() === o).click(), option);
  await wait(350);
};
await pick("Level", "B2");
await pick("Part", "2");
await p.evaluate(() => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const s = document.querySelector('input[name="statement"]');
  setter.call(s, "Compare the photographs and say how the people might be feeling.");
  s.dispatchEvent(new Event("input", { bubbles: true }));
});
await wait(250);
await p.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find((d) => d.textContent.trim() === "Hobbies" && d.children.length === 0);
  (el.closest("div[class]") ?? el).click();
});
await wait(400);
for (const term of ["mountains", "library"]) {
  await p.evaluate(() => [...document.querySelectorAll("div")].find((d) => d.textContent.trim() === "Select image" && d.children.length === 0).click());
  await wait(400);
  await p.evaluate((t) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const box = [...document.querySelectorAll("input")].find((i) => i.placeholder?.includes("nature"));
    setter.call(box, t); box.dispatchEvent(new Event("input", { bubbles: true }));
  }, term);
  await wait(2500);
  await p.evaluate(() => [...document.querySelectorAll("div")].find((d) => d.querySelector("img") && (d.getAttribute("style") || "").includes("100px")).click());
  await wait(1500);
}
console.log("before saving:", await p.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((x) => /Save/.test(x.textContent));
  const hint = [...document.querySelectorAll("p")].map((x) => x.textContent.trim()).find((t) => /needs between/.test(t));
  return { save: btn.disabled ? "disabled" : "enabled", hint: hint ?? "(none)" };
}));
await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Save/.test(x.textContent)).click());
await wait(3000);
const list = await fetch(`${BASE}/api/u/${u.userId}/questions/all`, { headers: { cookie: u.cookie } }).then((r) => r.json());
console.log("POSTs:", posts.length, "· rows:", Array.isArray(list) ? list.length : list);
if (Array.isArray(list)) for (const q of list) console.log(`  part ${q.part} · images ${JSON.stringify(q.image_ids)} · instructions ${JSON.stringify(q.instructions)}`);
await b.close();
