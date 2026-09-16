import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";

export const dynamic = "force-dynamic";

/**
 * Exams used to live here before the URLs became level-scoped. Kept so links
 * already handed out still work, and so the two things a person might type at
 * this path land somewhere sensible.
 */
export default async function LegacyExamPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // /exams/b2 is a natural guess for "B2 exams", and it matches this route
  // rather than /[level]/exams. Send it where the person meant to go.
  const level = await getLevel(id);
  if (level) redirect(`/${level.code}/exams`);

  // An id belonging to a real exam: look it up only to learn its level, then
  // move to the canonical URL.
  const exam = await getExam(await getViewer(), id);
  if (!exam) notFound();

  permanentRedirect(`/${exam.level}/exams/${exam.id}`);
}
