import { notFound, redirect } from "next/navigation";
import ExamBuilder, { type PickerQuestion } from "@/app/components/ExamBuilder";
import { getRequiredSlots } from "@/lib/cambridgeBlueprints";
import { getLevel } from "@/lib/levels";
import { getExam } from "@/lib/exams";
import { listQuestions } from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { BackLink } from "@/app/components/ExamCards";

export const dynamic = "force-dynamic";

export default async function EditExamPage({
  params
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level: code, id } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const viewer = await getViewer();
  const exam = await getExam(viewer, id);
  if (!exam) notFound();

  // The id identifies the exam on its own, so the level in the path is a
  // label. The run page does the same.
  if (exam.level !== level.code) {
    redirect(`/${exam.level}/exams/${exam.id}/edit`);
  }

  /* Reading an exam is not the same as being able to change it. House exams
     are readable by everyone and belong to nobody, so there is nothing to edit
     — sending those here would offer a form whose save could only ever 404. */
  const userId = await getAuthenticatedUserId();
  if (!userId || exam.is_house) {
    redirect(`/${exam.level}/exams/${exam.id}`);
  }

  const slots = getRequiredSlots(level.code);

  const questions = (
    await Promise.all(
      [...new Set(slots.map((slot) => slot.part))].map((part) =>
        listQuestions(viewer, { level: level.code, part })
      )
    )
  )
    .flat()
    .map((q) => ({
      id: q.id,
      part: q.part,
      statement: q.statement,
      statement_two: q.statement_two,
      follow_up: q.follow_up,
      decision: q.decision,
      themes: q.themes,
      image_ids: q.image_ids,
      prompts: q.prompts
    })) satisfies PickerQuestion[];

  // Keyed the way the builder keys its slots, so the existing choices land in
  // the right rows.
  const picked: Record<string, number> = {};
  for (const question of exam.questions) {
    picked[`${question.part}${question.candidate}`] = question.id;
  }

  return (
    <div className="page" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <BackLink href={`/${level.code}/exams/${exam.id}`}>
          {`← ${exam.title}`}
        </BackLink>
        <h1 style={{ marginBottom: "0.25rem" }}>Edit exam</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          Change the name, or swap the question in any part.
        </p>
      </div>
      <ExamBuilder
        level={level.code}
        levelLabel={level.label}
        slots={slots}
        questions={questions}
        exam={{ id: exam.id, title: exam.title, picked }}
      />
    </div>
  );
}
