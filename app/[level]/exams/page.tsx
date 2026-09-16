import { notFound } from "next/navigation";
import { listExams } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import {
  ExamCard,
  ExamList,
  ExamMeta,
  ExamTitle
} from "@/app/components/ExamCards";

export const dynamic = "force-dynamic";

export default async function LevelExamsPage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: code } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const exams = await listExams(await getViewer(), { level: level.code });

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1>{level.label} practice exams</h1>
        <p style={{ marginBottom: "2rem" }}>
          {`Full ${level.label} speaking tests, about ${level.minutes} minutes for a pair of candidates. Free ones need no account.`}
        </p>

        {exams.length === 0 ? (
          <p>{`No ${level.label} exams yet.`}</p>
        ) : (
          <ExamList>
            {exams.map((exam) => (
              <li key={exam.id}>
                <ExamCard
                  href={`/${level.code}/exams/${exam.id}`}
                  className="glass"
                >
                  <ExamTitle>{exam.title}</ExamTitle>
                  <ExamMeta>
                    {`${exam.question_count} questions · ~${level.minutes} min`}
                    {exam.is_house ? " · Free" : ""}
                  </ExamMeta>
                </ExamCard>
              </li>
            ))}
          </ExamList>
        )}
      </div>
    </div>
  );
}
