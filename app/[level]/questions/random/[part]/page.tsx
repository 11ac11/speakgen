import { notFound } from "next/navigation";
import Question from "@/app/components/Question";
import { QuestionControls } from "@/app/components/QuestionControls";
import { listQuestions } from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { isValidLevelPart } from "@/lib/questionRules";
import type { QuestionStructures } from "@/types/types";

// A different question on every render, so this must never be cached.
export const dynamic = "force-dynamic";

export default async function RandomQuestionPage({
  params
}: {
  params: Promise<{ level: string; part: string }>;
}) {
  const { level, part } = await params;

  // The level itself is already checked by app/[level]/layout.tsx; this rejects
  // a part the level does not have, such as a C2 Part 4.
  if (!isValidLevelPart(level, part)) notFound();

  const [question] = await listQuestions(await getViewer(), {
    level: level.toLowerCase(),
    part,
    random: true
  });

  if (!question) {
    return (
      <div className="container" style={{ paddingTop: "3rem" }}>
        <p>{`No ${level.toUpperCase()} Part ${part} questions yet.`}</p>
      </div>
    );
  }

  return (
    <>
      <QuestionControls question={question} part={part} />
      <Question
        question={question as unknown as QuestionStructures}
        part={part}
      />
    </>
  );
}
