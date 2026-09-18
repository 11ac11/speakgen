import { z } from "zod";
import { deleteExam, getExam, updateExam } from "@/lib/exams";
import { examSlotsSchema, missingSlots } from "@/app/api/exams/route";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const examUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slots: examSlotsSchema
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const exam = await getExam(await getViewer(), id);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }
    return NextResponse.json(exam);
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

    const parsed = examUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    }

    /* The level is the exam's own and cannot be edited, so it is read rather
       than taken from the request. Read through the viewer, which is also what
       makes a house exam or somebody else's a 404 here. */
    const existing = await getExam(await getViewer(), id);
    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const { title, slots } = parsed.data;

    const missing = missingSlots(existing.level, slots);
    if (missing === null) {
      return NextResponse.json({ error: "Unknown level" }, { status: 400 });
    }
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Exam is incomplete", missing },
        { status: 400 }
      );
    }

    // Scoped to the owner, so reading an exam is not the same as editing it:
    // a house exam is readable by everyone and editable by nobody.
    const updated = await updateExam(ownerId, id, title, slots);
    if (!updated) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    // A question that does not match its slot's level or part trips the
    // composite foreign key.
    if ((error as { code?: string })?.code === "23503") {
      return NextResponse.json(
        { error: "A question does not belong to that level and part" },
        { status: 400 }
      );
    }
    console.error("Exam update failed:", error);
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

    // Scoped to owner_id, so deleting a house exam or somebody else's is a 404
    // rather than a silent success.
    const deleted = await deleteExam(ownerId, id);
    if (!deleted) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error) {
    console.error("Exam deletion failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
