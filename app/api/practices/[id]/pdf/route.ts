import { NextRequest, NextResponse } from "next/server";
import { getPractice } from "@/lib/practices";
import { pdfFilename, renderPracticePdf } from "@/lib/pdf/script";
import { pdfResponse, refusePdfExport } from "@/lib/pdfAccess";
import { getViewer } from "@/lib/questionAccess";

/** One draw of the practice, on paper. Each request draws again. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const refusal = await refusePdfExport();
    if (refusal) return refusal;

    const { id } = await params;
    const practice = await getPractice(await getViewer(), id);
    if (!practice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return pdfResponse(
      await renderPracticePdf(practice),
      pdfFilename(practice.title)
    );
  } catch (error) {
    console.error("Practice PDF failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
