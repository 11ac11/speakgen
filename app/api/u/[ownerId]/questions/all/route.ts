import { listOwnedQuestions } from "@/lib/questions";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await context.params;
    const authenticatedUserId = await getAuthenticatedUserId();

    if (!ownerId || !authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (authenticatedUserId !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // One query now. This used to union eight per-part tables together with
    // interpolated schema names.
    return NextResponse.json(await listOwnedQuestions(ownerId));
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
