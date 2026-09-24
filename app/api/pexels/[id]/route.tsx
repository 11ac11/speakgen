import { NextResponse } from "next/server";
import { getPhoto } from "@/lib/pexels";

/**
 * One photograph's details. Cached at Vercel's edge for a week, as well as in
 * lib/pexels.ts, because a photograph's details never change and Pexels allows
 * 200 API calls an hour: a class opening the same exam should cost one.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const photo = await getPhoto(id);
  if (!photo) {
    // Not cached anywhere, so a moment's failure is retried next time.
    return NextResponse.json(
      { error: "Failed to fetch image by ID" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(photo, {
    headers: {
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
    }
  });
}
