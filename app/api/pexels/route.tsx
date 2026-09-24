import { NextResponse } from "next/server";
import { searchPhotos } from "@/lib/pexels";

/**
 * Photograph search, for the question form. Cached for an hour at the edge
 * and in lib/pexels.ts, since teachers searching the same topic get the same
 * results, and each search is one of Pexels' 200 calls an hour.
 */
export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get("query") ?? "";
  if (query.trim().length < 2) {
    return NextResponse.json({ photos: [] });
  }

  const results = await searchPhotos(query);
  if (!results) {
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600"
    }
  });
}
