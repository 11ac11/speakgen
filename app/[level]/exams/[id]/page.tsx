import { notFound, redirect } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import { BackLink, ExamsLink } from "@/app/components/ExamCards";
import { getAuthenticatedUserId } from "@/lib/session";
import ExamRunner from "@/app/components/ExamRunner";
import ContentActions from "@/app/components/ContentActions";
import { getEntitlements } from "@/lib/profile";
import { getShareLink, sharePath } from "@/lib/shareLinks";

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

  /* Reading an exam and being able to change it are different things: a house
     exam is readable by everyone and belongs to nobody. */
  const userId = await getAuthenticatedUserId();
  const canEdit = !!userId && !exam.is_house;

  // Sharing follows editing: the author or their school. PDF follows the plan,
  // and applies to house exams too, since anything you can run you can print.
  const [entitlements, shareLink] = await Promise.all([
    userId ? getEntitlements(userId) : null,
    canEdit && userId
      ? getShareLink(userId, { kind: "exam", id: exam.id })
      : null
  ]);

  return (
    <div className="page page-wide" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        {/* An exam of your own was reached from My exams; a house one from the
            free listing. Back should go where you actually came from. */}
        {canEdit ? (
          <BackLink href="/dashboard?tab=exams">← My exams</BackLink>
        ) : (
          <BackLink href={`/${level.code}/exams`}>
            {`← All ${level.label} exams`}
          </BackLink>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <h1 style={{ marginBottom: "0.25rem" }}>{exam.title}</h1>
          <ContentActions
            kind="exam"
            id={exam.id}
            pdf={
              !entitlements
                ? "hidden"
                : entitlements.pdfExport
                  ? "allowed"
                  : "upgrade"
            }
            canShare={canEdit}
            initialSharePath={shareLink ? sharePath(shareLink.token) : null}
          >
            {canEdit ? (
              <ExamsLink href={`/${level.code}/exams/${exam.id}/edit`}>
                Edit exam
              </ExamsLink>
            ) : null}
          </ContentActions>
        </div>
      </div>
      <ExamRunner exam={exam} />
    </div>
  );
}
