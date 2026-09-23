import { notFound } from "next/navigation";
import { getLevel } from "@/lib/levels";
import { getPractice } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import PracticeRunner from "@/app/components/PracticeRunner";
import { BackLink, ExamsLink } from "@/app/components/ExamCards";
import ContentActions from "@/app/components/ContentActions";
import { getEntitlements } from "@/lib/profile";
import { getAuthenticatedUserId } from "@/lib/session";
import { getShareLink, sharePath } from "@/lib/shareLinks";
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

  // As on the exam page: sharing and editing belong to the author or their
  // school, PDF export to the plan.
  const userId = await getAuthenticatedUserId();
  const canEdit = !!userId && !practice.is_house;
  const [entitlements, shareLink] = await Promise.all([
    userId ? getEntitlements(userId) : null,
    canEdit && userId
      ? getShareLink(userId, { kind: "practice", id: practice.id })
      : null
  ]);

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
          <ContentActions
            kind="practice"
            id={practice.id}
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
              <ExamsLink href={`/${level.code}/practices/${practice.id}/edit`}>
                Edit practice
              </ExamsLink>
            ) : null}
          </ContentActions>
        </div>
      </div>
      <PracticeRunner practice={practice} />
    </div>
  );
}
