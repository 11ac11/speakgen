import { notFound, redirect } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import { BackLink } from "@/app/components/ExamCards";
import ExamRunner from "@/app/components/ExamRunner";

export const dynamic = "force-dynamic";

export default async function LevelExamPage({
  params
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level: code, id } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  // A private exam belonging to somebody else is indistinguishable from one
  // that does not exist.
  const exam = await getExam(await getViewer(), id);
  if (!exam) notFound();

  // An exam id is unique on its own, so the level in the path is a label rather
  // than part of the lookup. If it disagrees, send the visitor to the canonical
  // URL instead of showing a B2 exam under /c1.
  if (exam.level !== level.code) redirect(`/${exam.level}/exams/${exam.id}`);

  return (
    <div className="page page-wide" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <BackLink href={`/${level.code}/exams`}>
          {`← All ${level.label} exams`}
        </BackLink>
        <h1 style={{ marginBottom: "0.25rem" }}>{exam.title}</h1>
      </div>
      <ExamRunner exam={exam} />
    </div>
  );
}
