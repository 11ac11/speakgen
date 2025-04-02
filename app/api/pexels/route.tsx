import { NextResponse } from "next/server";
import { createClient } from "pexels";

const pexels = createClient(process.env.PEXELS_API_KEY as string);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  try {
    const response = await pexels.photos.search({ query, per_page: 20 });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
