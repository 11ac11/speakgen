import puppeteer from "puppeteer-core";
import { signUpTestUser } from "./lib/testAuth.mjs";
const BASE = "http://localhost:3001";
const PART = process.env.PART ?? "1";
const LEVEL = process.env.LEVEL ?? "B2";
const u = await signUpTestUser(BASE, "submitchk");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
const posts = [];
p.on("request", (r) => { if (r.method() === "POST" && r.url().includes("/api/questions")) posts.push(1); });
p.on("pageerror", (e) => console.log("  PAGE ERROR:", e.message));
await p.setViewport({ width: 1180, height: 1300 });
await p.setCookie(...u.cookie.split("; ").map((c) => { const [n, ...r] = c.split("="); return { name: n, value: r.join("="), url: BASE, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }; }));
await p.goto(`${BASE}/questions/new`, { waitUntil: "networkidle0" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = async (label, option) => {
  await p.evaluate((l) => [...document.querySelectorAll("div")].find((d) => d.querySelector("label")?.textContent?.trim() === l && d.querySelector("input")).querySelector("input").click(), label);
  await wait(250);
  await p.evaluate((o) => [...document.querySelectorAll("li.dropdown-item")].find((li) => li.textContent.trim() === o).click(), option);
  await wait(350);
};
await pick("Level", LEVEL);
await pick("Part", PART);
await p.evaluate((part) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const s = document.querySelector('input[name="statement"]');
  setter.call(s, "Submit probe.");
  s.dispatchEvent(new Event("input", { bubbles: true }));
  if (part === "3") {
    const boxes = document.querySelectorAll('input[name^="prompt"]');
    ["a", "b", "c"].forEach((v, i) => { setter.call(boxes[i], v); boxes[i].dispatchEvent(new Event("input", { bubbles: true })); });
  }
}, PART);
await wait(300);
await p.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find((d) => d.textContent.trim() === "Hobbies" && d.children.length === 0);
  (el.closest("div[class]") ?? el).click();
});
await wait(400);
const btn = await p.evaluate(() => { const x = [...document.querySelectorAll("button")].find((y) => /Save/.test(y.textContent)); return { type: x.type, disabled: x.disabled }; });
console.log(`${LEVEL} part ${PART} · button:`, JSON.stringify(btn));
await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Save/.test(x.textContent)).click());
await wait(2500);
const list = await fetch(`${BASE}/api/u/${u.userId}/questions/all`, { headers: { cookie: u.cookie } }).then((r) => r.json());
console.log(`  POSTs: ${posts.length} · rows created: ${Array.isArray(list) ? list.length : JSON.stringify(list)}`);
await b.close();
