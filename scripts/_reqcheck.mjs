// C1 Part 3: Statement 2 is required and left empty. The browser should now
// block the save instead of the onClick path slipping past it.
import puppeteer from "puppeteer-core";
import { signUpTestUser } from "./lib/testAuth.mjs";
const BASE = "http://localhost:3001";
const u = await signUpTestUser(BASE, "reqchk");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
const posts = [];
p.on("request", (r) => { if (r.method() === "POST" && r.url().includes("/api/questions")) posts.push(1); });
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
await pick("Level", "C1");
await pick("Part", "3");
await p.evaluate(() => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const s = document.querySelector('input[name="statement"]');
  setter.call(s, "Required probe."); s.dispatchEvent(new Event("input", { bubbles: true }));
  const boxes = document.querySelectorAll('input[name^="prompt"]');
  ["choosing a job", "moving away", "studying more"].forEach((v, i) => { setter.call(boxes[i], v); boxes[i].dispatchEvent(new Event("input", { bubbles: true })); });
});
await wait(300);
await p.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find((d) => d.textContent.trim() === "Hobbies" && d.children.length === 0);
  (el.closest("div[class]") ?? el).click();
});
await wait(400);
await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Save/.test(x.textContent)).click());
await wait(2200);
const list = await fetch(`${BASE}/api/u/${u.userId}/questions/all`, { headers: { cookie: u.cookie } }).then((r) => r.json());
console.log("statement 2 required + empty → POSTs:", posts.length, "· rows created:", Array.isArray(list) ? list.length : list);

// Now fill it and confirm it saves exactly once.
await p.evaluate(() => {
  const ta = document.querySelector('[name="statement-2"]');
  const proto = ta.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(ta, "Then decide which matters most.");
  ta.dispatchEvent(new Event("input", { bubbles: true }));
});
await wait(300);
await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Save/.test(x.textContent)).click());
await wait(2500);
const list2 = await fetch(`${BASE}/api/u/${u.userId}/questions/all`, { headers: { cookie: u.cookie } }).then((r) => r.json());
console.log("after filling it     → POSTs:", posts.length, "· rows created:", Array.isArray(list2) ? list2.length : list2);
await b.close();
