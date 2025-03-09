import { neon } from "@neondatabase/serverless";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

export const sql = neon(DB_URL);
