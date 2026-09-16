// Apply a SQL migration file against DATABASE_URL.
//
//   node scripts/apply-migration.mjs migrations/006_content_foundation.sql
//
// Uses the simple query protocol so a file may contain multiple statements,
// dollar-quoted function bodies and its own BEGIN/COMMIT.

import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "node:fs";

config();

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-migration.mjs <file.sql>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("missing DATABASE_URL");
  process.exit(1);
}

const text = readFileSync(file, "utf8");
const sql = postgres(url, {
  max: 1,
  onnotice: (n) => console.log("notice:", n.message)
});

try {
  await sql.unsafe(text).simple();
  console.log(`applied ${file}`);
  process.exit(0);
} catch (error) {
  console.error(`failed ${file}\n`, error.message);
  process.exit(1);
}
