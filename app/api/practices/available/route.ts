import { z } from "zod";
import { countAvailable } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import { NextRequest, NextResponse } from "next/server";

/**
 * How many questions a filter can draw from, for whoever is asking.
 *
 * Its own route rather than a field on the create response, because the create
 * form needs it before there is anything to create: the count is what decides
 * whether the form can be submitted at all, and what the "write more questions"
 * message is counting.
 *
 * A GET with the filter in the query string, so it caches and cancels like any
 * other read and the form can fire one per keystroke without ceremony.
 */
const availableSchema = z.object({
  level: z.string().trim().min(1).max(8),
  part: z.union([z.string().trim().regex(/^\d$/), z.null()]),
  themes: z.array(z.string().trim().min(1)).max(18)
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const partParam = url.searchParams.get("part");

    const parsed = availableSchema.safeParse({
      level: url.searchParams.get("level") ?? "",
      // An absent or empty part is "every part", not a malformed one.
      part: partParam && partParam.length > 0 ? partParam : null,
      themes: url.searchParams.getAll("theme")
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
    }

    const { level, part, themes } = parsed.data;

    const available = await countAvailable(await getViewer(), {
      level: level.toLowerCase(),
      part: part === null ? null : Number(part),
      themes
    });

    return NextResponse.json({ available });
  } catch (error) {
    console.error("Availability count failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
