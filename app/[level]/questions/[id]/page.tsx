import { notFound, redirect } from "next/navigation";
import QuestionForm from "@/app/components/QuestionForm";
import { getQuestionById } from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { getLevel } from "@/lib/levels";

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level: code, id } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const question = await getQuestionById(await getViewer(), id);
  if (!question) notFound();

  // The id identifies the question on its own, so the level in the path is a
  // label. If it disagrees, send the visitor to the canonical URL rather than
  // showing a B2 question under /c1.
  if (question.level !== level.code) {
    redirect(`/${question.level}/questions/${question.id}`);
  }

  return (
    <QuestionForm
      question={question}
      partParam={question.part}
      levelParam={question.level.toUpperCase()}
    />
  );
}
