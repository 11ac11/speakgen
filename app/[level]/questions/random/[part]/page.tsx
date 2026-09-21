import { notFound } from "next/navigation";
import { getLevel } from "@/lib/levels";
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

  // For the heading only. The layout has already proved the level exists.
  const levelRow = await getLevel(level);

  const [question] = await listQuestions(await getViewer(), {
    level: level.toLowerCase(),
    part,
    random: true
  });

  if (!question) {
    return (
      <div className="page" style={{ paddingTop: "3rem" }}>
        <p>{`No ${level.toUpperCase()} Part ${part} questions yet.`}</p>
      </div>
    );
  }

  /* Named on the page, not just in the nav that brought you here. Three things
     draw questions now — an exam, a practice and this — and the two saved ones
     say what they are at the top of their own pages, so the unsaved one has to
     as well. */
  return (
    <div className="page" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>
          {`${levelRow?.label ?? level.toUpperCase()} random question`}
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          One question at a time, drawn from the whole bank. Nothing is saved —
          change the part, or draw another.
        </p>
      </div>
      <QuestionControls question={question} part={part} />
      <Question
        question={question as unknown as QuestionStructures}
        part={part}
      />
    </div>
  );
}
