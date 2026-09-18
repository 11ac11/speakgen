import {
  ConstraintViolationError,
  createQuestion,
  InvalidReferenceError,
  listQuestions
} from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { isValidLevelPart, questionCreateSchema } from "@/lib/questionRules";
import { getAuthenticatedUserWithProfile } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// The questions collection. Items live at /api/questions/[id], keyed on the id
// alone because it is unique across every level and part.
//
// Level and part are query parameters here rather than path segments. They used
// to be the path, as /api/questions/[level]/[part], which cannot coexist with an
// /api/questions/[id] item route: Next refuses two different dynamic slug names
// at the same position.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") ?? "";
    const part = searchParams.get("part") ?? "";
    const random = searchParams.get("random") === "true";

    if (!isValidLevelPart(level, part)) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const questions = await listQuestions(await getViewer(), {
      level: level.toLowerCase(),
      part,
      random
    });

    // ?random=true returns a single question; the plain list returns an array.
    if (random) {
      return questions.length
        ? NextResponse.json(questions[0])
        : NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Resolving the profile here is what guarantees a row exists for anyone
    // who signed up after migration 006. It is also where the plan limits will
    // be checked, so the read is not wasted.
    const session = await getAuthenticatedUserWithProfile();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const ownerId = session.userId;

    const parsed = questionCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      // Only our own rules are quoted back. Zod's built-in messages describe
      // the schema ("String must contain at least 1 character(s)") rather than
      // the mistake, so they stay behind the generic line.
      const named = parsed.error.issues.find((i) => i.code === "custom");
      return NextResponse.json(
        { error: named?.message ?? "Invalid question payload" },
        { status: 400 }
      );
    }

    const { level, part, ...payload } = parsed.data;
    if (!isValidLevelPart(level, part)) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const question = await createQuestion(
      ownerId,
      level.toLowerCase(),
      part,
      payload
    );

    // No row means content.levels.enabled is false for this level.
    if (!question) {
      return NextResponse.json(
        { error: "Level is not available" },
        { status: 400 }
      );
    }

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (
      error instanceof InvalidReferenceError ||
      error instanceof ConstraintViolationError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Database insertion failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
