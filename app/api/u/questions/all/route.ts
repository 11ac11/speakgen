import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

// List schemas you want to include (manually for safety)
const allowedLevels = ["b2", "c1"];

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allQueries: string[] = [];

    for (const level of allowedLevels) {
      for (let part = 1; part <= 4; part++) {
        allQueries.push(`
          SELECT '${level}' AS level, '${part}' AS part, id, statement, themes, owner_id, public
          FROM ${level}.part${part}
          WHERE owner_id = ${user.id}
        `);
      }
    }
    const unionSubquery = allQueries.join(" UNION ALL ");

    const finalQuery = `
      SELECT * FROM (
        ${unionSubquery}
      ) AS q
      ORDER BY level, part::int, id
    `;

    const result = await sql(finalQuery);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
