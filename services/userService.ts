import { sql } from "@/lib/db";

export async function getUsers() {
  try {
    const response = await sql`SELECT * FROM users`;
    return response; // Ensure only rows are returned
  } catch (error) {
    console.error("Database query failed:", error);
    return [];
  }
}
