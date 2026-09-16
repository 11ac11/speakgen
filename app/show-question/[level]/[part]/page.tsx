import React from "react";
import { notFound } from "next/navigation";
import Question from "@/app/components/Question";
import { QuestionControls } from "@/app/show-question/[level]/[part]/QuestionControls";
import { listQuestions } from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { isValidLevelPart } from "@/lib/questionRules";
import type { QuestionStructures } from "@/types/types";

// A random question every time, so this must never be cached.
export const dynamic = "force-dynamic";

const ShowQuestion = async ({
  params
}: {
  params: Promise<{ part: string; level: string }>;
}) => {
  const { part, level } = await params;

  if (!isValidLevelPart(level, part)) notFound();

  // Queried directly rather than fetched back through the API. This used to
  // call NEXT_PUBLIC_API_URL, which pins a host and port into a server-side
  // request to the same process: it points at :3000 while dev runs on :3001,
  // so the page threw.
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
};

export default ShowQuestion;
