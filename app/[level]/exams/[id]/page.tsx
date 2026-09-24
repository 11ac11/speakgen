import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import { BackLink } from "@/app/components/ExamCards";
import { getAuthenticatedUserId } from "@/lib/session";
import ExamRunner from "@/app/components/ExamRunner";
import ContentActions from "@/app/components/ContentActions";
import { getShareLink, sharePath } from "@/lib/shareLinks";
import { privatePage } from "@/lib/site";

/* One read of the exam per request, shared by the title and the page. */
const loadExam = cache(async (id: string) => getExam(await getViewer(), id));

/**
 * A house exam is free and public, so it is titled for search. Somebody's own
 * exam gets its title in the tab and stays out of the index — it is only
 * readable by its author and their school, so a crawler would find a 404.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ level: string; id: string }>;
}): Promise<Metadata> {
  const { level: code, id } = await params;
  const [exam, level] = await Promise.all([loadExam(id), getLevel(code)]);
  if (!exam) return {};
  if (!exam.is_house) return privatePage(exam.title);

  const label = level?.label ?? exam.level.toUpperCase();
  // House exams are already named for their level ("B2 First — Practice
  // Exam 1"); say the level only when the title does not.
  return {
    title: exam.title.includes(label)
      ? exam.title
      : `${exam.title} · ${label} speaking exam`,
    description: `A complete ${label} speaking test, free to run with no account: every part in order, timed as on the day.`
  };
}

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
  const exam = await loadExam(id);
  if (!exam) notFound();

  // An exam id is unique on its own, so the level in the path is a label rather
  // than part of the lookup. If it disagrees, send the visitor to the canonical
  // URL instead of showing a B2 exam under /c1.
  if (exam.level !== level.code) redirect(`/${exam.level}/exams/${exam.id}`);

  /* Reading an exam and being able to change it are different things: a house
     exam is readable by everyone and belongs to nobody. */
  const userId = await getAuthenticatedUserId();
  const canEdit = !!userId && !exam.is_house;

  /* This page is the runner, on a screen in front of a class, so it carries
     only Share. Editing and PDF export are on the exam's card in the
     dashboard. Sharing follows editing: the author or their school. */
  const shareLink =
    canEdit && userId
      ? await getShareLink(userId, { kind: "exam", id: exam.id })
      : null;

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
          {canEdit ? (
            <ContentActions
              kind="exam"
              id={exam.id}
              initialSharePath={shareLink ? sharePath(shareLink.token) : null}
            />
          ) : null}
        </div>
      </div>
      <ExamRunner exam={exam} />
    </div>
  );
}
