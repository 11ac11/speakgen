// /app/api/questions/route.ts
import { sql } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to fetch all questions
export async function GET(req: NextRequest) {
  try {
    const questions = await sql`SELECT * FROM fce.part1`;
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
