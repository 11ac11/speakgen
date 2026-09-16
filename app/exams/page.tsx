import { listExams } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";
import { CAMBRIDGE_SPEAKING_BLUEPRINTS } from "@/lib/cambridgeBlueprints";
import { ExamCard, ExamList, ExamMeta, ExamTitle } from "./ExamCards";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const exams = await listExams(await getViewer());

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1>Practice exams</h1>
        <p style={{ marginBottom: "2rem" }}>
          Full Cambridge speaking tests, run straight through. Free ones need no
          account.
        </p>

        {exams.length === 0 ? (
          <p>No exams yet.</p>
        ) : (
          <ExamList>
            {exams.map((exam) => {
              const blueprint =
                CAMBRIDGE_SPEAKING_BLUEPRINTS[
                  exam.level as keyof typeof CAMBRIDGE_SPEAKING_BLUEPRINTS
                ];

              return (
                <li key={exam.id}>
                  <ExamCard href={`/exams/${exam.id}`} className="glass">
                    <ExamTitle>{exam.title}</ExamTitle>
                    <ExamMeta>
                      {exam.level.toUpperCase()}
                      {blueprint ? ` · ${blueprint.qualification}` : ""}
                      {` · ${exam.question_count} questions`}
                      {blueprint
                        ? ` · ~${blueprint.speakingPairMinutes} min`
                        : ""}
                      {exam.is_house ? " · Free" : ""}
                    </ExamMeta>
                  </ExamCard>
                </li>
              );
            })}
          </ExamList>
        )}
      </div>
    </div>
  );
}
