import { listLevels } from "@/lib/levels";
import { Lead } from "@/app/components/Lead";
import { ExamsLink } from "@/app/components/ExamCards";

export const metadata = { title: "New question — SpeakGen" };
export const dynamic = "force-dynamic";

/**
 * The level chooser, and all that is left here.
 *
 * The form moved to /[level]/questions/new, so this URL has no level to give
 * it. It is kept rather than removed because it is linked from the nav, from
 * the practice builder's empty state and from anywhere a teacher has
 * bookmarked it — and a chooser is a better answer to those than a redirect
 * to whichever level happens to sort first.
 *
 * Levels come from the database, so this lists whatever is enabled rather than
 * a hardcoded four.
 */
export default async function ChooseLevelPage() {
  const levels = await listLevels();

  return (
    <div className="page" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: "60ch" }}>
        <h1>New question</h1>
        <Lead>
          Which exam is it for? The level decides what the form asks for, so it
          is chosen first.
        </Lead>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {levels.map((level) => (
            <ExamsLink key={level.code} href={`/${level.code}/questions/new`}>
              {level.label}
            </ExamsLink>
          ))}
        </div>
      </div>
    </div>
  );
}
