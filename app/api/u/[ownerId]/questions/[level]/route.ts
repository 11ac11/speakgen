import { listOwnedQuestions } from "@/lib/questions";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ ownerId: string; level: string }> }
) {
  try {
    const { level, ownerId } = await context.params;
    const authenticatedUserId = await getAuthenticatedUserId();

    if (!authenticatedUserId || authenticatedUserId !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      await listOwnedQuestions(ownerId, { level: level.toLowerCase() })
    );
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
