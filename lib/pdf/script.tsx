import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getActiveBranding } from "@/lib/branding";
import type { Exam } from "@/lib/exams";
import { getLevel } from "@/lib/levels";
import type { Practice } from "@/lib/practices";
import type { QuestionRow } from "@/lib/questions";
import { buildScript } from "@/lib/pdf/frame";
import { loadImage, loadQuestionPhotos } from "@/lib/pdf/images";
import ScriptDocument, {
  type RenderedBooklet,
  type ScriptBranding,
  type ScriptInput
} from "@/lib/pdf/ScriptDocument";

/**
 * Turns an exam or a practice into the speaking test on paper: an interlocutor
 * frame for the examiner, and the candidate booklet pages it hands out.
 *
 * The wording is built in lib/pdf/frame.ts from the same blueprint the runner
 * uses, so the paper and the screen cannot disagree about how a part runs.
 * This file only fetches what the pages need — photographs, the school's
 * branding — and hands it to the renderer.
 */

async function toBranding(
  organizationId: string | null
): Promise<ScriptBranding | null> {
  const branding = await getActiveBranding(organizationId);
  if (!branding) return null;

  return {
    name: branding.name,
    accentColor: branding.accentColor,
    logo: branding.logoUrl ? await loadImage(branding.logoUrl) : null
  };
}

async function toGroups(
  level: string,
  questions: QuestionRow[],
  closing: string
): Promise<ScriptInput["groups"]> {
  return Promise.all(
    buildScript(level, questions, closing).map(async (group) => ({
      frames: group.frames,
      booklet: await Promise.all(
        group.booklet.map(async (page): Promise<RenderedBooklet> =>
          page.kind === "photos"
            ? { ...page, photos: await loadQuestionPhotos(page.photoIds) }
            : page
        )
      )
    }))
  );
}

async function render(
  subject: { level: string; title: string; organization_id: string | null },
  questions: QuestionRow[],
  options: { kind: string; note: string | null; closing: string }
) {
  const [level, branding, groups] = await Promise.all([
    getLevel(subject.level),
    toBranding(subject.organization_id),
    toGroups(subject.level, questions, options.closing)
  ]);
  const label = level?.label ?? subject.level.toUpperCase();

  const input: ScriptInput = {
    title: subject.title,
    cover: [label.toUpperCase(), options.kind, subject.title.toUpperCase()],
    note: options.note,
    header: `${label} Speaking · ${subject.title}`,
    groups,
    branding
  };

  return renderToBuffer(<ScriptDocument input={input} />);
}

export async function renderExamPdf(exam: Exam) {
  return render(exam, exam.questions, {
    kind: "SPEAKING",
    note: null,
    closing: "Thank you. That is the end of the test."
  });
}

/**
 * A practice has no fixed questions, so its PDF is one draw of it, and says so.
 * Downloading again gives a different set, which is the point of a practice.
 */
export async function renderPracticePdf(practice: Practice) {
  const drawnOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return render(practice, practice.questions, {
    kind: "SPEAKING PRACTICE",
    note: `A set drawn on ${drawnOn}. The practice draws a new set each time, so another download gives different questions.`,
    closing: "Thank you. That is the end of the practice."
  });
}

/** A filename a teacher would recognise in their downloads folder. */
export function pdfFilename(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60);
  return `${slug || "speakgen"}.pdf`;
}
