import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLevel } from "@/lib/levels";
import { getPractice } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import PracticeRunner from "@/app/components/PracticeRunner";
import { BackLink } from "@/app/components/ExamCards";
import ContentActions from "@/app/components/ContentActions";
import { getAuthenticatedUserId } from "@/lib/session";
import { getShareLink, sharePath } from "@/lib/shareLinks";
import { privatePage } from "@/lib/site";

/* One draw per request. Without the cache the title would run the practice's
   random draw a second time, and throw the result away. */
const loadPractice = cache(async (id: string) =>
  getPractice(await getViewer(), id)
);

// Practices are a teacher's own, so they are titled but never indexed.
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const practice = await loadPractice(id);
  return practice ? privatePage(practice.title) : {};
}
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

  const practice = await loadPractice(id);
  if (!practice) notFound();

  // The level in the path has to agree with the row, as the exam pages do.
  if (practice.level !== level.code) notFound();

  // As on the exam page: only Share here, for the author or their school.
  // Editing and PDF export are on the practice's card in the dashboard.
  const userId = await getAuthenticatedUserId();
  const canEdit = !!userId && !practice.is_house;
  const shareLink =
    canEdit && userId
      ? await getShareLink(userId, { kind: "practice", id: practice.id })
      : null;

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <div>
            <h1 style={{ marginBottom: "0.25rem" }}>{practice.title}</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
              {`${level.label} · ${partName} · ${themeNames || "any theme"} · a new set every time`}
            </p>
          </div>
          {canEdit ? (
            <ContentActions
              kind="practice"
              id={practice.id}
              initialSharePath={shareLink ? sharePath(shareLink.token) : null}
            />
          ) : null}
        </div>
      </div>
      <PracticeRunner practice={practice} />
    </div>
  );
}
