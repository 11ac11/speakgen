import Link from "next/link";
import { notFound } from "next/navigation";
import { listExams } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { getUsage } from "@/lib/limits";
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

  const viewer = await getViewer();
  const exams = await listExams(viewer, { level: level.code });

  const userId = await getAuthenticatedUserId();
  const usage = userId ? await getUsage(userId) : null;
  const atLimit =
    usage !== null &&
    usage.exams.limit !== null &&
    usage.exams.used >= usage.exams.limit;

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1>{level.label} practice exams</h1>
        <p style={{ marginBottom: "2rem" }}>
          {`Full ${level.label} speaking tests, about ${level.minutes} minutes for a pair of candidates. Free ones need no account.`}
        </p>

        {usage ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem"
            }}
          >
            <span style={{ color: "var(--lightgrey)", fontSize: "0.9rem" }}>
              {usage.exams.limit === null
                ? `${usage.exams.used} of your own exams`
                : `${usage.exams.used} of ${usage.exams.limit} exams used on the ${usage.plan} plan`}
            </span>
            <Link
              href={atLimit ? "/pricing" : `/${level.code}/exams/new`}
              className="glass"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.6rem",
                color: "var(--slategrey)",
                fontWeight: 500,
                fontSize: "0.9rem"
              }}
            >
              {atLimit ? "Upgrade for more exams" : "New exam"}
            </Link>
          </div>
        ) : null}

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
