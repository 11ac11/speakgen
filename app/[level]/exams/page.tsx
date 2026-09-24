import { notFound } from "next/navigation";
import { listExams } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { getUsage } from "@/lib/limits";
import { isWaitlistMode } from "@/lib/waitlist";
import WaitlistButton from "@/app/components/Waitlist";
import { Lead } from "@/app/components/Lead";
import {
  ExamCard,
  ExamList,
  ExamMeta,
  ExamsLink,
  ExamThemes,
  ExamTitle
} from "@/app/components/ExamCards";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const row = await getLevel(level);
  if (!row) return {};
  return {
    title: `${row.label} speaking exams`,
    description: `Full ${row.label} speaking tests, free and with no account: every part in order, timed as on the day.`
  };
}

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
        <Lead>
          {`Free ${level.label} speaking tests, about ${level.minutes} minutes for a pair of candidates. No account needed.`}
        </Lead>

        {/* Above the exams rather than under them: somebody who has not run one
            of these before needs the format first, and asking them to scroll
            past every exam to find it would answer the question too late. */}
        <div style={{ marginBottom: "2rem" }}>
          <ExamsLink href={`/${level.code}`}>
            {`How the ${level.label} exam works`}
          </ExamsLink>
        </div>

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
            {atLimit && isWaitlistMode() && !usage.joinedWaitlist ? (
              <WaitlistButton
                plan="pro"
                trigger="exam_limit"
                signedIn
                text="Join the waitlist for another exam"
                variant="chip"
              />
            ) : (
              <ExamsLink
                href={
                  atLimit && !isWaitlistMode()
                    ? "/pricing"
                    : "/dashboard?tab=exams"
                }
              >
                {atLimit && !isWaitlistMode()
                  ? "Upgrade for more exams"
                  : "My exams"}
              </ExamsLink>
            )}
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
                  <ExamThemes themes={exam.themes} />
                </ExamCard>
              </li>
            ))}
          </ExamList>
        )}
      </div>
    </div>
  );
}
