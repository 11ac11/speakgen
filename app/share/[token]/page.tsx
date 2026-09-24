import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveBranding } from "@/lib/branding";
import { accentTokens } from "@/lib/brandColors";
import { getExam } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import { getPractice } from "@/lib/practices";
import { resolveShareLink } from "@/lib/shareLinks";
import ExamRunner from "@/app/components/ExamRunner";
import PracticeRunner from "@/app/components/PracticeRunner";
import SharedHeader from "@/app/components/SharedHeader";
import { SITE_NAME } from "@/lib/site";

// A link can be revoked at any moment and a practice draws afresh each visit.
export const dynamic = "force-dynamic";

const loadLink = cache(resolveShareLink);
const loadBranding = cache(getActiveBranding);

/**
 * Private links: kept out of search engines, and no Referer, so the token is
 * not handed to every host a photograph on the page is loaded from.
 *
 * Titled for the preview a chat app draws when a teacher pastes the link to a
 * class: the exam's name and whose it is, the school's when it is branded.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const hidden = {
    robots: { index: false, follow: false },
    referrer: "no-referrer" as const
  };

  const { token } = await params;
  const link = await loadLink(token);
  if (!link) return hidden;

  const branding = await loadBranding(link.organizationId);
  const from = branding?.name ?? SITE_NAME;
  const what = link.kind === "exam" ? "speaking exam" : "speaking practice";
  const title = `${link.title} — ${from}`;
  const description = `A ${link.level.toUpperCase()} ${what} to run in the browser, with no account needed.`;

  return {
    ...hidden,
    title: { absolute: title },
    description,
    openGraph: { title, description, siteName: from },
    twitter: { title, description }
  };
}

/**
 * A shared exam or practice, for a student without an account.
 *
 * The viewer here is built from the link and can read the one thing the link
 * names. A revoked, mistyped or deleted link is a 404, the same as one that
 * never existed. Never an ad here: students may be minors, and this page is
 * what the Academy plan's branding is for.
 */
export default async function SharedPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await loadLink(token);
  if (!link) notFound();

  const [level, branding] = await Promise.all([
    getLevel(link.level),
    loadBranding(link.organizationId)
  ]);
  if (!level) notFound();

  const style = (
    branding?.accentColor ? accentTokens(branding.accentColor) : {}
  ) as React.CSSProperties;

  const header = (title: string, meta: string) => (
    <SharedHeader
      branding={
        branding ? { name: branding.name, logoUrl: branding.logoUrl } : null
      }
      title={title}
      meta={meta}
    />
  );

  if (link.kind === "exam") {
    const exam = await getExam(link.viewer, String(link.id));
    if (!exam) notFound();

    return (
      <div
        className="page page-wide"
        style={{ paddingTop: "2.5rem", ...style }}
      >
        {header(exam.title, `${level.label} · Speaking exam`)}
        <ExamRunner exam={exam} />
      </div>
    );
  }

  const practice = await getPractice(link.viewer, String(link.id));
  if (!practice) notFound();

  const partName =
    practice.part === null ? "any part" : `Part ${practice.part}`;

  return (
    <div className="page" style={{ paddingTop: "2.5rem", ...style }}>
      {header(
        practice.title,
        `${level.label} · ${partName} · a new set every time`
      )}
      <PracticeRunner practice={practice} />
    </div>
  );
}
