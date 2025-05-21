import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Handle GET request: Fetch a specific question by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string; id: string }> }
) {
  try {
    const { level, part, id } = await context.params;

    if (!["1", "2", "3", "4"].includes(part)) {
      return NextResponse.json(
        { error: "Invalid part number" },
        { status: 400 }
      );
    }

    // Safe table name mapping
    const tableMap: Record<string, string> = {
      "1": `${level}.part1`,
      "2": `${level}.part2`,
      "3": `${level}.part3`,
      "4": `${level}.part4`,
    };

    const tableName = tableMap[part];
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

// Handle PATCH request: Update a specific question by id
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string; id: string }> }
) {
  try {
    const { level, part, id } = await context.params;
    const body = await req.json();

    if (!["1", "2", "3", "4"].includes(part)) {
      return NextResponse.json(
        { error: "Invalid part number" },
        { status: 400 }
      );
    }

    const tableMap: Record<string, string> = {
      "1": `${level}.part1`,
      "2": `${level}.part2`,
      "3": `${level}.part3`,
      "4": `${level}.part4`,
    };

    const tableName = tableMap[part];

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    // Build SET clause with positional parameters: $2, $3, ...
    const setClauses = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = [id, ...keys.map((key) => body[key])];

    const query = `UPDATE ${tableName} SET ${setClauses} WHERE id = $1 RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Database update failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handle DELETE request: Delete a specific question by id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string; id: string }> }
) {
  try {
    const { level, part, id } = await context.params;

    if (!["1", "2", "3", "4"].includes(part)) {
      return NextResponse.json(
        { error: "Invalid part number" },
        { status: 400 }
      );
    }

    const tableMap: Record<string, string> = {
      "1": `${level}.part1`,
      "2": `${level}.part2`,
      "3": `${level}.part3`,
      "4": `${level}.part4`,
    };

    const tableName = tableMap[part];
    const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
    const result = await sql(query, [id]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Database delete failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
