// Runs every check suite against the dev server, in sequence.
//
// The pause is deliberate. Each suite opens its own database connections and
// drives the dev server hard; fired back to back with no gap they exhaust the
// dev server's workers and the connection pool, and fail for reasons that have
// nothing to do with the code under test.
import { spawnSync } from "node:child_process";

const SUITES = [
  "check-plans",
  "check-billing",
  "check-billing-ui",
  "check-plan-limits",
  "check-question-routes",
  "check-ads",
  "check-academy",
  "check-sharing"
];

const PAUSE_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = 0;

for (const [index, suite] of SUITES.entries()) {
  process.stdout.write(`${suite.padEnd(24)} `);

  const run = spawnSync("node", [`scripts/${suite}.mjs`], { encoding: "utf8" });
  const ok = run.status === 0;

  console.log(ok ? "pass" : "FAIL");
  if (!ok) {
    failed++;
    // The whole tail, not a grep: a suite can die without printing the word
    // FAIL at all, and guessing at the interesting lines hides exactly those.
    for (const line of (run.stdout ?? "").trimEnd().split("\n").slice(-6)) {
      console.log(`  | ${line}`);
    }
    // Separately, because a suite that dies rather than failing a check prints
    // nothing to stdout and everything here.
    const stderr = (run.stderr ?? "").trimEnd();
    if (stderr) {
      for (const line of stderr.split("\n").slice(0, 6)) {
        console.log(`  ! ${line}`);
      }
    }
  }

  if (index < SUITES.length - 1) await sleep(PAUSE_MS);
}

console.log(
  failed
    ? `\n${failed} of ${SUITES.length} suites failed`
    : `\nall ${SUITES.length} suites pass`
);
process.exit(failed ? 1 : 0);
