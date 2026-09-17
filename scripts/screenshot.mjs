// Screenshots pages in the installed Chrome, signed in as a throwaway user.
//
//   node scripts/screenshot.mjs /b2/exams/new /pricing
//   node scripts/screenshot.mjs --anon /            (signed out)
//
// Uses puppeteer-core against the Chrome already on the machine, so nothing is
// downloaded. Exists because status codes cannot show a fixed banner covering
// a card, or a list that truncates.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { signUpTestUser } from "./lib/testAuth.mjs";

const BASE = process.env.SCREENSHOT_BASE ?? "http://localhost:3001";
const OUT = process.env.SCREENSHOT_DIR ?? "/tmp/speakgen-shots";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = process.argv.slice(2);
const anon = args.includes("--anon");
const paths = args.filter((a) => !a.startsWith("--"));

if (paths.length === 0) {
  console.error("usage: node scripts/screenshot.mjs [--anon] <path> [path...]");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

const user = anon ? null : await signUpTestUser(BASE, "shot");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"]
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 1400, deviceScaleFactor: 2 });

  if (user) {
    // __Secure- prefixed cookies are rejected unless marked secure. Chrome
    // treats localhost as a secure context, so this works over plain http.
    await page.setCookie(
      ...user.cookie.split("; ").map((c) => {
        const [name, ...rest] = c.split("=");
        return {
          name,
          value: rest.join("="),
          url: BASE,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "Lax"
        };
      })
    );
  }

  for (const path of paths) {
    await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    const name = path.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-") || "home";
    const file = `${OUT}/${name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
} finally {
  await browser.close();
}
