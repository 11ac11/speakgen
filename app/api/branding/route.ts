import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { BrandingForbiddenError, saveBranding } from "@/lib/branding";
import { isReadableAccent, normalizeHex } from "@/lib/brandColors";
import { getAuthenticatedUserId } from "@/lib/session";

/* An empty string clears a field, so the form can send what is in its inputs
   without deciding what "blank" means. */
const brandingSchema = z.object({
  organizationId: z.string().uuid(),
  displayName: z
    .string()
    .trim()
    .max(80)
    .transform((v) => v || null),
  accentColor: z
    .string()
    .trim()
    .transform((v) => (v ? (normalizeHex(v) ?? "invalid") : null))
});

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const parsed = brandingSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid branding" }, { status: 400 });
    }

    const { organizationId, displayName, accentColor } = parsed.data;

    if (accentColor === "invalid") {
      return NextResponse.json(
        { error: "The colour should be a hex value such as #1f6e3c." },
        { status: 400 }
      );
    }

    // The same check the form runs, repeated because the form is only advice.
    if (accentColor && !isReadableAccent(accentColor)) {
      return NextResponse.json(
        {
          error:
            "That colour is too light for white button text. Try a darker shade."
        },
        { status: 400 }
      );
    }

    await saveBranding(userId, organizationId, { displayName, accentColor });
    return NextResponse.json({ displayName, accentColor });
  } catch (error) {
    if (error instanceof BrandingForbiddenError) {
      // 402 for the plan, as the plan limits use, so the client can offer an
      // upgrade rather than a bare refusal.
      return NextResponse.json(
        { error: error.message, reason: error.reason },
        { status: error.reason === "not_entitled" ? 402 : 403 }
      );
    }
    console.error("Saving branding failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
