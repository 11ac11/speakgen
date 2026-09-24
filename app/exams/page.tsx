import { Lead } from "@/app/components/Lead";
import { listExams } from "@/lib/exams";
import { listLevels } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import {
  ExamCard,
  ExamList,
  ExamMeta,
  ExamThemes,
  ExamTitle
} from "@/app/components/ExamCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Cambridge speaking exams",
  description:
    "Complete B1, B2, C1 and C2 speaking tests, free and with no account: every part in order, with the timings of the real exam."
};

export const dynamic = "force-dynamic";

/**
 * Every level's exams in one place. The per-level pages at /[level]/exams are
 * the canonical listings; this is the way in when no level has been chosen yet.
 */
export default async function AllExamsPage() {
  const [exams, levels] = await Promise.all([
    listExams(await getViewer()),
    listLevels()
  ]);

  const byCode = new Map(levels.map((level) => [level.code, level]));

  return (
    <div className="page" style={{ paddingTop: "4rem" }}>
      <div>
        <h1>Practice exams</h1>
        <Lead>
          Full Cambridge speaking tests, run straight through. Free ones need no
          account.
        </Lead>

        {levels.map((level) => {
          const forLevel = exams.filter((exam) => exam.level === level.code);
          if (forLevel.length === 0) return null;

          return (
            <section key={level.code} style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ margin: "0 0 1rem 0" }}>{level.label}</h2>
              <ExamList>
                {forLevel.map((exam) => (
                  <li key={exam.id}>
                    <ExamCard
                      href={`/${exam.level}/exams/${exam.id}`}
                      className="glass"
                    >
                      <ExamTitle>{exam.title}</ExamTitle>
                      <ExamMeta>
                        {`${exam.question_count} questions · ~${
                          byCode.get(exam.level)?.minutes ?? "?"
                        } min`}
                        {exam.is_house ? " · Free" : ""}
                      </ExamMeta>
                      <ExamThemes themes={exam.themes} />
                    </ExamCard>
                  </li>
                ))}
              </ExamList>
            </section>
          );
        })}

        {exams.length === 0 ? <p>No exams yet.</p> : null}
      </div>
    </div>
  );
}
