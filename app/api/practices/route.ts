import { z } from "zod";
import { countAvailable, createPractice, listPractices } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import { assertWithinPlan, PlanLimitError } from "@/lib/limits";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/**
 * A practice is a filter, so what the client sends is a filter: which level,
 * which part if any, which themes if any, and how many to draw.
 *
 * `part` is nullable rather than optional-and-absent so "every part" is a value
 * the client states rather than a key it forgets.
 */
export const practiceCreateSchema = z.object({
  level: z.string().trim().min(1).max(8),
  title: z.string().trim().min(1).max(120),
  part: z
    .union([z.string().trim().regex(/^\d$/), z.null()])
    .transform((v) => (v === null ? null : Number(v))),
  themes: z.array(z.string().trim().min(1)).max(18).default([]),
  question_count: z.number().int().min(1).max(50)
});

export async function GET(req: NextRequest) {
  try {
    const level = new URL(req.url).searchParams.get("level") ?? undefined;
    return NextResponse.json(await listPractices(await getViewer(), { level }));
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

    const parsed = practiceCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid practice" }, { status: 400 });
    }

    const { level, title, part, themes, question_count } = parsed.data;
    const code = level.toLowerCase();

    /* Re-counted here rather than trusted from the form. The number the form
       showed came from this same function, but it was true when it was fetched:
       a question made private in another tab between then and Save would leave
       a practice that cannot fill itself. This is also the only check — the
       database cannot express "enough questions exist", because the questions
       are not referenced. */
    const viewer = await getViewer();
    const available = await countAvailable(viewer, {
      level: code,
      part,
      themes
    });

    if (available < question_count) {
      return NextResponse.json(
        {
          error: "Not enough questions to draw from",
          available,
          requested: question_count
        },
        { status: 400 }
      );
    }

    await assertWithinPlan(ownerId, "practices");

    const practice = await createPractice(ownerId, {
      level: code,
      title,
      part,
      themes,
      question_count
    });

    if (!practice) {
      return NextResponse.json(
        { error: "Level is not available" },
        { status: 400 }
      );
    }

    return NextResponse.json(practice, { status: 201 });
  } catch (error) {
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
    // An unknown theme, level or part trips a foreign key.
    if ((error as { code?: string })?.code === "23503") {
      return NextResponse.json(
        { error: "Unknown level, part or theme" },
        { status: 400 }
      );
    }
    console.error("Practice creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
