// /app/api/questions/random/route.ts
import { sql } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to fetch random question
export async function GET(req: NextRequest) {
  try {
    const question =
      await sql`SELECT * FROM fce.part1 ORDER BY RANDOM() LIMIT 1`;
    return NextResponse.json(question[0] || null);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
