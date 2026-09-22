import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLevel } from "@/lib/levels";
import QuestionForm from "@/app/components/QuestionForm";

export async function generateMetadata({
  params
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const row = await getLevel(level);
  return { title: row ? `New ${row.label} question — Speakgen` : "Speakgen" };
}

export const dynamic = "force-dynamic";

/**
 * Writing a question for one level, chosen before the form opens.
 *
 * It used to live at /questions/new with the level as the first field, which
 * made a question's level a thing you could change halfway through writing it
 * — after picking photographs for a task the new level does not have, or
 * prompts it counts differently. The level decides what the form even asks
 * for, so it belongs in the URL, where it is settled before anything is typed
 * and survives a reload.
 *
 * The part stays open, because a teacher writing a set of questions works
 * through the parts of one level rather than one part across levels.
 */
export default async function NewQuestionPage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: code } = await params;
  const level = await getLevel(code);
  if (!level) notFound();

  return <QuestionForm levelParam={level.code} lockLevel />;
}
