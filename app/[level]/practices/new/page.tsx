import { notFound, redirect } from "next/navigation";
import PracticeBuilder from "@/app/components/PracticeBuilder";
import { getLevel } from "@/lib/levels";
import { getViewer } from "@/lib/questionAccess";
import { BackLink } from "@/app/components/ExamCards";
import type { Metadata } from "next";
import { privatePage } from "@/lib/site";

export async function generateMetadata({
  params
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const row = await getLevel(level);
  if (!row) return {};
  return privatePage(`New ${row.label} practice`);
}

export const dynamic = "force-dynamic";

export default async function NewPracticePage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: code } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const viewer = await getViewer();
  if (viewer.kind !== "user") redirect("/login");

  /* No questions are loaded here, unlike the exam builder. A practice stores a
     filter rather than a chosen set, so the only thing the form needs from the
     server is how many questions the filter currently matches — and that
     changes as they click, so it comes from /api/practices/available rather
     than from this render. */
  return (
    <div className="page" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <BackLink href="/dashboard?tab=practices">← My practices</BackLink>
        <h1
          style={{ marginBottom: "0.25rem" }}
        >{`New ${level.label} practice`}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          A practice is a rule, not a fixed list — every time you run it, a new
          set of questions is drawn.
        </p>
      </div>
      <PracticeBuilder level={level.code} levelLabel={level.label} />
    </div>
  );
}
