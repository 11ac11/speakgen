// /app/api/questions/route.ts
import { sql } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests to fetch all questions
export async function GET(
  req: NextRequest,
  context: { params: { part: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const isRandom = searchParams.get("random") === "true";

    // ✅ Await params before using it
    const { part } = await context.params;

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
    const random = isRandom ? " ORDER BY RANDOM() LIMIT 1" : "";
    const query = `SELECT * FROM ${tableName}${random}`;
    const result = await sql(query);

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
  context: { params: { part: string } }
) {
  const { part } = await context.params;

  if (!["1", "2", "3", "4"].includes(part)) {
    return NextResponse.json({ error: "Invalid part number" }, { status: 400 });
  }

  try {
    const body = await req.json();
    let query;

    switch (part) {
      case "1": {
        const { question, themes, owner_id, public: isPublic } = body;
        query = sql`
          INSERT INTO fce.part1 (question, themes, owner_id, public)
          VALUES (${question}, ${themes}, ${owner_id}, ${isPublic})
          RETURNING *;
        `;
        break;
      }

      case "2": {
        const {
          question,
          themes,
          owner_id,
          public: isPublic,
          image_one,
          image_two,
        } = body;
        query = sql`
          INSERT INTO fce.part2 (question, themes, owner_id, public, image_one, image_two)
          VALUES (${question}, ${themes}, ${owner_id}, ${isPublic}, ${image_one}, ${image_two})
          RETURNING *;
        `;
        break;
      }

      case "3": {
        const { question, prompts, themes, owner_id, public: isPublic } = body;
        query = sql`
          INSERT INTO fce.part3 (question, prompts, themes, owner_id, public)
          VALUES (${question}, ${prompts}, ${themes}, ${owner_id}, ${isPublic})
          RETURNING *;
        `;
        break;
      }

      case "4": {
        const { question, themes, owner_id, public: isPublic } = body;
        query = sql`
          INSERT INTO fce.part4 (question, themes, owner_id, public)
          VALUES (${question}, ${themes}, ${owner_id}, ${isPublic})
          RETURNING *;
        `;
        break;
      }
    }

    if (!query) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const newQuestion = await query;
    return NextResponse.json(newQuestion[0], { status: 201 });
  } catch (error) {
    console.error("Database insertion failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
