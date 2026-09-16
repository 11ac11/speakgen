import { listOwnedQuestions } from "@/lib/questions";
import { isValidLevelPart } from "@/lib/questionRules";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// The POST that used to live here was removed. It ran no authentication check,
// took owner_id from the request body so a caller could write rows as anybody,
// and interpolated the unvalidated `level` path segment straight into
// `INSERT INTO ${level}.part${part}`. Creating a question goes through
// POST /api/questions/[level]/[part], which authenticates and takes the owner
// from the session.

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ ownerId: string; level: string; part: string }>;
  }
) {
  try {
    const { ownerId, level, part } = await context.params;
    const authenticatedUserId = await getAuthenticatedUserId();

    if (!authenticatedUserId || authenticatedUserId !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isValidLevelPart(level, part)) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      await listOwnedQuestions(ownerId, { level: level.toLowerCase(), part })
    );
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
