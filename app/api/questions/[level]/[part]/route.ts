// /app/api/questions/route.ts
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

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

    if (!["1", "2", "3", "4"].includes(part)) {
      return NextResponse.json(
        { error: "Invalid part number" },
        { status: 400 }
      );
    }

    // ✅ Safe table name mapping
    const tableMap: Record<string, string> = {
      "1": `${level}.part1`,
      "2": `${level}.part2`,
      "3": `${level}.part3`,
      "4": `${level}.part4`,
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
  context: { params: Promise<{ level: string; part: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    // ⛔ If user is not logged in, block insertion
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { level, part } = await context.params;

    if (!["1", "2", "3", "4"].includes(part)) {
      return NextResponse.json(
        { error: "Invalid part number" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const tableName = `${level}.part${part}`;

    // Required fields NO LONGER include owner_id
    const commonFields = ["statement", "themes", "public"];
    const partSpecificFields: Record<string, string[]> = {
      "1": [],
      "2": ["image_ids"],
      "3": ["prompts"],
      "4": [],
    };

    const userProvidedFields = [
      ...commonFields,
      ...(partSpecificFields[part] || []),
    ];

    // Check missing required fields
    const missingFields = userProvidedFields.filter(
      (field) => !(field in body)
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Automatically add owner_id column + value
    const columns = [...userProvidedFields, "owner_id"].join(", ");

    // Create placeholder list ($1, $2, ...)
    const placeholders = [...userProvidedFields, "owner_id"]
      .map((_, i) => `$${i + 1}`)
      .join(", ");

    // Add values from body and finally user.id
    const values = [...userProvidedFields.map((f) => body[f]), user.id];
    console.log("values:", values);
    console.log("columns:", columns);
    console.log("placeholders:", placeholders);

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
