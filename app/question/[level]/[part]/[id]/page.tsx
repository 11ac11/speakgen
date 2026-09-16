import { notFound } from "next/navigation";
import QuestionForm from "@/app/components/QuestionForm";
import { getQuestionById } from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";

export const dynamic = "force-dynamic";

const EditQuestion = async ({
  params
}: {
  params: Promise<{ id: string; part: string; level: string }>;
}) => {
  const { id } = await params;

  // Queried directly rather than fetched back through the API, which used to
  // go out over HTTP to NEXT_PUBLIC_API_URL and therefore to a hardcoded host
  // and port. A question id is unique on its own, so level and part in the
  // path are only there for the form's benefit.
  const question = await getQuestionById(await getViewer(), id);

  if (!question) notFound();

  return (
    <QuestionForm
      question={question}
      partParam={question.part}
      levelParam={question.level.toUpperCase()}
    />
  );
};

export default EditQuestion;
