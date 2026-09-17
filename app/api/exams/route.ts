import { z } from "zod";
import { createExam, listExams } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";
import { getRequiredSlots } from "@/lib/cambridgeBlueprints";
import { assertWithinPlan, PlanLimitError } from "@/lib/limits";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const examCreateSchema = z.object({
  level: z.string().trim().min(1).max(8),
  title: z.string().trim().min(1).max(120),
  slots: z
    .array(
      z.object({
        part: z.string().trim().regex(/^\d$/),
        candidate: z.enum(["A", "B", "-"]),
        question_id: z.number().int().positive()
      })
    )
    .min(1)
});

export async function GET(req: NextRequest) {
  try {
    const level = new URL(req.url).searchParams.get("level") ?? undefined;
    return NextResponse.json(await listExams(await getViewer(), { level }));
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
    const ownerId = await getAuthenticatedUserId();
    if (!ownerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsed = examCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    }

    const { level, title, slots } = parsed.data;

    // The database enforces that each question matches its slot's level and
    // part. Completeness is the half it cannot express, so it is checked here
    // against the blueprint: an exam missing a part is not an exam.
    const required = getRequiredSlots(level);
    if (required.length === 0) {
      return NextResponse.json({ error: "Unknown level" }, { status: 400 });
    }

    const given = new Set(slots.map((s) => `${s.part}${s.candidate}`));
    const missing = required.filter(
      (slot) => !given.has(`${slot.part}${slot.candidate}`)
    );
    if (missing.length > 0 || slots.length !== required.length) {
      return NextResponse.json(
        {
          error: "Exam is incomplete",
          missing: missing.map((s) =>
            s.candidate === "-"
              ? `Part ${s.part}`
              : `Part ${s.part} (${s.candidate})`
          )
        },
        { status: 400 }
      );
    }

    await assertWithinPlan(ownerId, "exams");

    const exam = await createExam(ownerId, level.toLowerCase(), title, slots);
    if (!exam) {
      return NextResponse.json(
        { error: "Level is not available" },
        { status: 400 }
      );
    }

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    // 402 so the client can tell "upgrade to continue" apart from "your
    // request was wrong".
    if (error instanceof PlanLimitError) {
      return NextResponse.json(
        {
          error: "Plan limit reached",
          resource: error.resource,
          limit: error.limit,
          plan: error.plan
        },
        { status: 402 }
      );
    }
    // A question that does not match its slot's level or part trips the
    // composite foreign key.
    if ((error as { code?: string })?.code === "23503") {
      return NextResponse.json(
        { error: "A question does not belong to that level and part" },
        { status: 400 }
      );
    }
    console.error("Exam creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
