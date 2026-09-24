import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLevel } from "@/lib/levels";
import { getCambridgeSpeakingBlueprint } from "@/lib/cambridgeBlueprints";
import { Lead } from "@/app/components/Lead";
import LevelInstructions from "./LevelInstructions";

/**
 * What the speaking test looks like at this level.
 *
 * /b2 and its siblings were 404s — the only URLs in the app a teacher would
 * guess at and not get. They are also the natural home for the one thing the
 * app knew and never said: the shape of the test. Every part's length, who
 * talks, which parts run twice, how many photographs or prompts a question
 * carries and what the runner is going to reveal behind its Continue button
 * are all in the blueprint already, and were only ever visible to somebody
 * reading the source.
 *
 * So this page is rendered from the blueprint rather than written out. A level
 * added later gets its instructions the moment it gets its entry, which is the
 * same reason B1 needed no new components last week — and a page written by
 * hand would be the one place left that could disagree with the runner.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const row = await getLevel(level);

  return row
    ? {
        title: `${row.label} speaking exam format`,
        description: `How the ${row.label} speaking test runs, part by part: what each task asks of the candidates and how long it lasts, with free exams and questions to practise.`
      }
    : {};
}

export const dynamic = "force-dynamic";

export default async function LevelPage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;

  /* The layout has already 404'd an unknown or disabled level, so this is only
     reached for one the database knows. The blueprint is the second half: a
     level could be enabled in content.levels before anybody has described its
     test, and there is nothing to print for one of those. */
  const row = await getLevel(level);
  const blueprint = row ? getCambridgeSpeakingBlueprint(row.code) : null;
  if (!row || !blueprint) notFound();

  return (
    <div className="page" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: "70ch" }}>
        <h1>{`${row.label} speaking exam`}</h1>
        <Lead>
          {`${blueprint.tasks.length} parts, about ${row.minutes} minutes for a pair of candidates. Here is what happens in each one.`}
        </Lead>

        <LevelInstructions
          blueprint={blueprint}
          levelCode={row.code}
          levelLabel={row.label}
          minutes={row.minutes}
        />
      </div>
    </div>
  );
}
