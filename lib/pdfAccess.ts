import { NextResponse } from "next/server";
import { getEntitlements } from "@/lib/profile";
import { getAuthenticatedUserId } from "@/lib/session";
import { recordUsage } from "@/lib/usage";

/**
 * PDF export is a Pro feature, so it needs an account and a plan that has it.
 * 402 rather than 403, as the plan limits use, so the client can tell "upgrade"
 * apart from "not allowed".
 *
 * Returns a response to send back, or null to carry on.
 */
export async function refusePdfExport(): Promise<NextResponse | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { pdfExport } = await getEntitlements(userId);
  if (!pdfExport) {
    await recordUsage("pdf_limit");
    return NextResponse.json(
      { error: "PDF export is part of Pro", reason: "upgrade" },
      { status: 402 }
    );
  }

  return null;
}

export function pdfResponse(bytes: ArrayLike<number>, filename: string) {
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // A teacher's private exam, and a practice draws afresh every time.
      "Cache-Control": "private, no-store"
    }
  });
}
