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
    let result;

    switch (part) {
      case "1":
        result = isRandom
          ? await sql`SELECT * FROM fce.part1 ORDER BY RANDOM() LIMIT 1`
          : await sql`SELECT * FROM fce.part1`;
        break;
      case "2":
        result = isRandom
          ? await sql`SELECT * FROM fce.part2 ORDER BY RANDOM() LIMIT 1`
          : await sql`SELECT * FROM fce.part2`;
        break;
      case "3":
        result = isRandom
          ? await sql`SELECT * FROM fce.part3 ORDER BY RANDOM() LIMIT 1`
          : await sql`SELECT * FROM fce.part3`;
        break;
      case "4":
        result = isRandom
          ? await sql`SELECT * FROM fce.part4 ORDER BY RANDOM() LIMIT 1`
          : await sql`SELECT * FROM fce.part4`;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid part number" },
          { status: 400 }
        );
    }

    return NextResponse.json(isRandom ? result[0] || null : result);
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
        const { question, themes, owner_id, public: isPublic } = body;
        query = sql`
          INSERT INTO fce.part2 (question, themes, owner_id, public)
          VALUES (${question}, ${themes}, ${owner_id}, ${isPublic})
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
