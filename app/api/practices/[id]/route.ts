import { z } from "zod";
import {
  countAvailable,
  deletePractice,
  getPractice,
  updatePractice
} from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/* The level is absent on purpose. It is the practice's own and is read from the
   row rather than taken from the request: changing it would be a different
   practice, not an edit of this one. Everything else is the filter, and all of
   the filter is editable. */
const practiceUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  part: z
    .union([z.string().trim().regex(/^\d$/), z.null()])
    .transform((v) => (v === null ? null : Number(v))),
  themes: z.array(z.string().trim().min(1)).max(18).default([]),
  question_count: z.number().int().min(1).max(50)
});

/**
 * One practice, with a set drawn for this request. Two GETs give two different
 * sets, which is the point of a practice rather than a bug in the caching.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const practice = await getPractice(await getViewer(), id);
    if (!practice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(practice);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ownerId = await getAuthenticatedUserId();
    if (!ownerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsed = practiceUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid practice" }, { status: 400 });
    }

    const viewer = await getViewer();

    /* Read for the level, which the request does not carry. This is also what
       makes a house practice or somebody else's a 404 rather than a refusal
       that admits the row exists. */
    const existing = await getPractice(viewer, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { title, part, themes, question_count } = parsed.data;

    // The same check the create route makes, for the same reason: an edit can
    // narrow a practice past what its pool can fill.
    const available = await countAvailable(viewer, {
      level: existing.level,
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

    // Scoped to the owner, so reading a practice is not the same as editing it.
    const updated = await updatePractice(ownerId, id, {
      title,
      part,
      themes,
      question_count
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as { code?: string })?.code === "23503") {
      return NextResponse.json(
        { error: "Unknown part or theme" },
        { status: 400 }
      );
    }
    console.error("Practice update failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Deleted outright rather than soft-deleted, as exams are: a practice holds no
 * questions, so there is nothing to orphan and nothing to put back.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ownerId = await getAuthenticatedUserId();
    if (!ownerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Scoped to the owner in the DELETE itself, so someone else's practice is
    // indistinguishable from one that does not exist.
    if (!(await deletePractice(ownerId, id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Practice deletion failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
