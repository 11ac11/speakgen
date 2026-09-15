// /app/api/questions/route.ts
import { sql } from "@/lib/db";
import { getValidatedQuestionTable } from "@/lib/questionRules";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to fetch all questions
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ ownerId: string; level: string }> }
) {
  try {
    // ✅ Await params before using it
    const { level, ownerId } = await context.params;
    const authenticatedUserId = await getAuthenticatedUserId();

    if (!authenticatedUserId || authenticatedUserId !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parts = ["1", "2", "3", "4"];

    const queries = parts.map((part, index) => {
      const table = getValidatedQuestionTable(level, part);
      if (!table) {
        throw new Error("Invalid level or part");
      }

      const query = `SELECT *, '${
        index + 1
      }' AS part FROM ${table} WHERE owner_id = $1`;
      return sql(query, [ownerId]);
    });

    const results = await Promise.all(queries);
    const allResults = results.flat(); // flatten into one array

    return NextResponse.json(allResults);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
