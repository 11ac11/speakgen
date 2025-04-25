import { NextResponse } from "next/server";
import { createClient } from "pexels";

// Initialize the Pexels client
const pexels = createClient(process.env.PEXELS_API_KEY as string);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // The ID comes from the dynamic URL parameter

  try {
    // Fetch image by ID
    const response = await pexels.photos.show({ id });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch image by ID" },
      { status: 500 }
    );
  }
}
