import { sql } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to fetch all questions created by a specific user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("owner_id");

    if (!ownerId) {
      return NextResponse.json(
        { error: "Missing owner_id parameter" },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT '1' AS part, id, statement, themes, owner_id, public FROM fce.part1 WHERE owner_id = 2
      UNION ALL
      SELECT '2' AS part, id, statement, themes, owner_id, public FROM fce.part2 WHERE owner_id = 2
      UNION ALL
      SELECT '3' AS part, id, statement, themes, owner_id, public FROM fce.part3 WHERE owner_id = 2
      UNION ALL
      SELECT '4' AS part, id, statement, themes, owner_id, public FROM fce.part4 WHERE owner_id = 2
    `;

    /* will need to add below when implemented
            ORDER BY part, id; // maybe here is an issue?
    */

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
