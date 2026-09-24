import { notFound, redirect } from "next/navigation";
import PracticeBuilder from "@/app/components/PracticeBuilder";
import { getLevel } from "@/lib/levels";
import { getPractice } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import { getAuthenticatedUserId } from "@/lib/session";
import { BackLink } from "@/app/components/ExamCards";
import type { Metadata } from "next";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("Edit practice");

export const dynamic = "force-dynamic";

export default async function EditPracticePage({
  params
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level: code, id } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const viewer = await getViewer();
  const practice = await getPractice(viewer, id);
  if (!practice) notFound();

  // The id identifies the practice on its own, so the level in the path is a
  // label. The run page does the same.
  if (practice.level !== level.code) {
    redirect(`/${practice.level}/practices/${practice.id}/edit`);
  }

  /* Reading a practice is not the same as being able to change it. A house
     practice is readable by everyone and belongs to nobody, so sending one here
     would offer a form whose save could only ever 404. */
  const userId = await getAuthenticatedUserId();
  if (!userId || practice.is_house) {
    redirect(`/${practice.level}/practices/${practice.id}`);
  }

  return (
    <div className="page" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <BackLink href={`/${level.code}/practices/${practice.id}`}>
          {`← ${practice.title}`}
        </BackLink>
        <h1 style={{ marginBottom: "0.25rem" }}>Edit practice</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          Rename it, or change what it draws. The questions themselves are drawn
          fresh each run, so there is nothing else to swap.
        </p>
      </div>
      <PracticeBuilder
        level={level.code}
        levelLabel={level.label}
        practice={{
          id: practice.id,
          title: practice.title,
          part: practice.part,
          themes: practice.themes,
          question_count: practice.question_count
        }}
      />
    </div>
  );
}
