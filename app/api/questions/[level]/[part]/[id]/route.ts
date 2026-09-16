import { sql } from "@/lib/db";
import {
  getQuestionColumns,
  getValidatedQuestionTable,
  questionPayloadSchema
} from "@/lib/questionRules";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Handle GET request: Fetch a specific question by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string; id: string }> }
) {
  try {
    const { level, part, id } = await context.params;

    const tableName = getValidatedQuestionTable(level, part);
    if (!tableName) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const ownerId = await getAuthenticatedUserId();
    const query = ownerId
      ? `SELECT * FROM ${tableName} WHERE id = $1 AND (public = true OR owner_id = $2) LIMIT 1`
      : `SELECT * FROM ${tableName} WHERE id = $1 AND public = true LIMIT 1`;
    const result = ownerId
      ? await sql(query, [id, ownerId])
      : await sql(query, [id]);

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
    const tableName = getValidatedQuestionTable(level, part);
    if (!tableName) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const ownerId = await getAuthenticatedUserId();
    if (!ownerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsed = questionPayloadSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question payload" },
        { status: 400 }
      );
    }

    const allowedColumns = getQuestionColumns(level.toLowerCase(), part).filter(
      (column) => column !== "owner_id"
    );
    const keys = Object.keys(parsed.data)
      .map((key) => {
        if (key === "image_ids" && level.toLowerCase() === "c1" && part === "2") {
          return ["image_one", "image_two"];
        }
        return [key];
      })
      .flat()
      .filter((key) => allowedColumns.includes(key));
    if (keys.length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    const setClauses = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values: unknown[] = [id];
    for (const key of keys) {
      if (key === "image_one") values.push(parsed.data.image_ids?.[0]);
      else if (key === "image_two") values.push(parsed.data.image_ids?.[1]);
      else values.push(parsed.data[key as keyof typeof parsed.data]);
    }

    const query = `UPDATE ${tableName} SET ${setClauses} WHERE id = $1 AND owner_id = $${
      values.length + 1
    } RETURNING *`;
    values.push(ownerId);
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

    const tableName = getValidatedQuestionTable(level, part);
    if (!tableName) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const ownerId = await getAuthenticatedUserId();
    if (!ownerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const query = `DELETE FROM ${tableName} WHERE id = $1 AND owner_id = $2 RETURNING *`;
    const result = await sql(query, [id, ownerId]);

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
