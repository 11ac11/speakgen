import { notFound } from "next/navigation";
import { getLevel } from "@/lib/levels";
import { getPractice } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import PracticeRunner from "@/app/components/PracticeRunner";
import { BackLink } from "@/app/components/ExamCards";
import { THEME_VALUES_FOR_PILLS } from "@/constants";

// A practice draws a new set on every render, so this must never be cached.
export const dynamic = "force-dynamic";

export default async function PracticePage({
  params
}: {
  params: Promise<{ level: string; id: string }>;
}) {
  const { level: code, id } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  const practice = await getPractice(await getViewer(), id);
  if (!practice) notFound();

  // The level in the path has to agree with the row, as the exam pages do.
  if (practice.level !== level.code) notFound();

  const partName =
    practice.part === null ? "any part" : `Part ${practice.part}`;
  const themeNames = practice.themes
    .map(
      (slug) =>
        THEME_VALUES_FOR_PILLS.find((t) => t.value === slug)?.label ?? slug
    )
    .join(" and ");

  return (
    <div className="page" style={{ paddingTop: "3rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <BackLink href="/dashboard?tab=practices">← My practices</BackLink>
        <h1 style={{ marginBottom: "0.25rem" }}>{practice.title}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
          {`${level.label} · ${partName} · ${themeNames || "any theme"} · a new set every time`}
        </p>
      </div>
      <PracticeRunner practice={practice} />
    </div>
  );
}
