import { sql } from "@/lib/db";
import {
  getQuestionColumns,
  getValidatedQuestionTable,
  questionPayloadSchema
} from "@/lib/questionRules";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to fetch all questions
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const isRandom = searchParams.get("random") === "true";

    // ✅ Await params before using it
    const { level, part } = await context.params;

    const tableName = getValidatedQuestionTable(level, part);
    if (!tableName) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const ownerId = await getAuthenticatedUserId();
    const random = isRandom ? " ORDER BY RANDOM() LIMIT 1" : "";
    const query = ownerId
      ? `SELECT * FROM ${tableName} WHERE public = true OR owner_id = $1${random}`
      : `SELECT * FROM ${tableName} WHERE public = true${random}`;
    const result = ownerId ? await sql(query, [ownerId]) : await sql(query);

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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string }> }
) {
  try {
    const { level, part } = await context.params;

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

    const parsed = questionPayloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question payload" },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const allFields = getQuestionColumns(level.toLowerCase(), part);
    const columns = allFields.join(", ");
    const placeholders = allFields.map((_, i) => `$${i + 1}`).join(", ");
    const values = allFields.map((field) =>
      field === "owner_id" ? ownerId : body[field as keyof typeof body]
    );

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const result = await sql(query, values);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Database insertion failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
