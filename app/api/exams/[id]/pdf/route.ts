import { NextRequest, NextResponse } from "next/server";
import { getExam } from "@/lib/exams";
import { pdfFilename, renderExamPdf } from "@/lib/pdf/script";
import { pdfResponse, refusePdfExport } from "@/lib/pdfAccess";
import { getViewer } from "@/lib/questionAccess";
import { recordUsage } from "@/lib/usage";

/**
 * The exam as an examiner's script. Anything the viewer can run, they can
 * export — house exams included — provided their plan has PDF export.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const refusal = await refusePdfExport();
    if (refusal) return refusal;

    const { id } = await params;
    const exam = await getExam(await getViewer(), id);
    if (!exam)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const pdf = await renderExamPdf(exam);
    await recordUsage("pdf_export", { level: exam.level, examId: exam.id });
    return pdfResponse(pdf, pdfFilename(exam.title));
  } catch (error) {
    console.error("Exam PDF failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
