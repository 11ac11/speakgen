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
  ExamsLink,
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
  const exams = await listExams(viewer, { level: level.code, houseOnly: true });

  const userId = await getAuthenticatedUserId();
  const usage = userId ? await getUsage(userId) : null;
  const atLimit =
    usage !== null &&
    usage.exams.limit !== null &&
    usage.exams.used >= usage.exams.limit;

  return (
    <div className="page" style={{ paddingTop: "4rem" }}>
      <div>
        <h1>{level.label} practice exams</h1>
        <p style={{ marginBottom: "2rem" }}>
          {`Free ${level.label} speaking tests, about ${level.minutes} minutes for a pair of candidates. No account needed.`}
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
            <span
              style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}
            >
              {usage.exams.limit === null
                ? `You have built ${usage.exams.used} of your own`
                : `You have built ${usage.exams.used} of ${usage.exams.limit} on the ${usage.plan} plan`}
            </span>
            {/* This page is the free ones only, so a signed-in teacher needs a
                way across to their own rather than finding them mixed in. */}
            <ExamsLink href={atLimit ? "/pricing" : "/dashboard?tab=exams"}>
              {atLimit ? "Upgrade for more exams" : "My exams"}
            </ExamsLink>
          </div>
        ) : null}

        {exams.length === 0 ? (
          <p>{`No free ${level.label} exams yet.`}</p>
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
                    {`${exam.question_count} questions · ~${level.minutes} min · Free`}
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
