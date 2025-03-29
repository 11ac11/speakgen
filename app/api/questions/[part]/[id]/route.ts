import { sql } from "../../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { part: string; id: string } }
) {
  try {
    const { part, id } = await context.params;

    if (!["1", "2", "3", "4"].includes(part)) {
      return NextResponse.json(
        { error: "Invalid part number" },
        { status: 400 }
      );
    }

    // ✅ Safe table name mapping
    const tableMap: Record<string, string> = {
      "1": "fce.part1",
      "2": "fce.part2",
      "3": "fce.part3",
      "4": "fce.part4",
    };

    const tableName = tableMap[part];

    // // ✅ Safe query: Table name interpolated, id parameterized
    // const result = await sql`SELECT * FROM ${sql(
    //   tableName
    // )} WHERE id = ${id} LIMIT 1`;

    const query = `SELECT * FROM ${tableName} WHERE id = $1 LIMIT 1`;
    const result = await sql(query, [id]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
