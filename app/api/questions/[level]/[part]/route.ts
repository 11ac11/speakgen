import {
  createQuestion,
  InvalidReferenceError,
  listQuestions
} from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { isValidLevelPart, questionPayloadSchema } from "@/lib/questionRules";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string }> }
) {
  try {
    const { level, part } = await context.params;
    if (!isValidLevelPart(level, part)) {
      return NextResponse.json(
        { error: "Invalid level or part" },
        { status: 400 }
      );
    }

    const random = new URL(req.url).searchParams.get("random") === "true";
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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ level: string; part: string }> }
) {
  try {
    const { level, part } = await context.params;
    if (!isValidLevelPart(level, part)) {
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

    const question = await createQuestion(
      ownerId,
      level.toLowerCase(),
      part,
      parsed.data
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
    if (error instanceof InvalidReferenceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Database insertion failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
