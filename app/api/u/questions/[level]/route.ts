// /app/api/questions/route.ts
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

// Handle GET requests to fetch all questions
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ level: string }> },
) {
  try {
    // ✅ Await params before using it
    const user = await stackServerApp.getUser();
    const { level } = await context.params;

    const parts = ["part1", "part2", "part3", "part4"];

    const queries = parts.map((part, index) => {
      const table = `${level}.${part}`;
      const query = `SELECT *, '${
        index + 1
      }' AS part FROM ${table} WHERE owner_id = '${user?.id}'`;
      return sql(query);
    });

    const results = await Promise.all(queries);
    const allResults = results.flat(); // flatten into one array

    if (allResults.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(allResults);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
