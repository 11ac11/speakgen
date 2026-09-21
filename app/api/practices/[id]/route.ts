import { deletePractice, getPractice } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

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
