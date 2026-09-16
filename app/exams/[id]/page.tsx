import { notFound, permanentRedirect } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";

export const dynamic = "force-dynamic";

/**
 * Exams used to live here before the URLs became level-scoped. Kept so links
 * already handed out still work; it looks the exam up only to learn its level
 * and then sends the visitor to the canonical /[level]/exams/[id].
 */
export default async function LegacyExamPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await getExam(await getViewer(), id);

  if (!exam) notFound();

  permanentRedirect(`/${exam.level}/exams/${exam.id}`);
}
