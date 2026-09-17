import {
  deleteQuestion,
  getQuestionById,
  InvalidReferenceError,
  updateQuestion
} from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { questionPayloadSchema } from "@/lib/questionRules";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// A question id is unique across every level and part, so these routes take the
// id alone. They used to sit under /api/questions/[level]/[part]/[id], where the
// level and part were carried through the path but ignored by the lookup.

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const question = await getQuestionById(await getViewer(), id);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    // Scoped to owner_id, so editing house content or somebody else's question
    // is a 404 rather than a silent no-op.
    const question = await updateQuestion(ownerId, id, parsed.data);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    if (error instanceof InvalidReferenceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Database update failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const ownerId = await getAuthenticatedUserId();
    if (!ownerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const deleted = await deleteQuestion(ownerId, id);
    if (!deleted) {
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
