import { notFound, redirect } from "next/navigation";
import ExamBuilder, { type PickerQuestion } from "@/app/components/ExamBuilder";
import { getRequiredSlots } from "@/lib/cambridgeBlueprints";
import { getLevel } from "@/lib/levels";
import { listQuestions } from "@/lib/questions";
import { getViewer } from "@/lib/questionAccess";
import { BackLink } from "@/app/components/ExamCards";

export const dynamic = "force-dynamic";

export default async function NewExamPage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: code } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const viewer = await getViewer();
  if (viewer.kind !== "user") redirect("/login");

  const slots = getRequiredSlots(level.code);

  // Everything the viewer may use: house questions plus their own. Loaded on
  // the server so the picker does not need an API round trip per part.
  const perPart = await Promise.all(
    [...new Set(slots.map((s) => s.part))].map((part) =>
      listQuestions(viewer, { level: level.code, part })
    )
  );

  // The whole question, not just its text: the picker shows themes, and the
  // chosen question previews its photographs or prompts.
  const questions: PickerQuestion[] = perPart.flat().map((q) => ({
    id: q.id,
    part: q.part,
    statement: q.statement,
    statement_two: q.statement_two,
    follow_up: q.follow_up,
    decision: q.decision,
    themes: q.themes,
    image_ids: q.image_ids,
    prompts: q.prompts
  }));

  return (
    <div
      className="container"
      style={{ paddingTop: "3rem", flexDirection: "column" }}
    >
      <div style={{ width: "100%", maxWidth: 820, marginBottom: "1rem" }}>
        <BackLink href={`/${level.code}/exams`}>
          {`← All ${level.label} exams`}
        </BackLink>
        <h1 style={{ marginBottom: "0.25rem" }}>{`New ${level.label} exam`}</h1>
        <p style={{ color: "var(--lightgrey)", marginTop: 0 }}>
          Pick one question for each part. Part 2 runs twice, once per
          candidate.
        </p>
      </div>
      <ExamBuilder
        level={level.code}
        levelLabel={level.label}
        slots={slots}
        questions={questions}
      />
    </div>
  );
}
