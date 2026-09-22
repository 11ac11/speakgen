import {
  getCambridgeSpeakingTask,
  type CambridgePhaseSource
} from "@/lib/cambridgeBlueprints";

/**
 * A part of the test, resolved against the question actually being run.
 *
 * The blueprint says how many phases a part has and where each one's words come
 * from; this is that shape filled in. Nothing new is stored to make it: every
 * phase reads a column content.questions has held all along, and the only thing
 * that changed is that something now knows they are a sequence rather than four
 * unrelated fields to print down the page.
 */
export type QuestionPhase = {
  source: CambridgePhaseSource;
  /** The interlocutor's line into this phase, where it has one. */
  label: string | null;
  /** What is on screen: the question, the follow-up, the decision. */
  text: string;
  seconds: number;
};

/** The text columns a question can carry, as the runners receive them. */
export type PhasedQuestion = {
  statement?: string | null;
  statement_two?: string | null;
  follow_up?: string | null;
  decision?: string | null;
  /** C2's collaborative task writes its own phase labels; see below. */
  instructions?: string[] | null;
};

function textFor(question: PhasedQuestion, source: CambridgePhaseSource) {
  return (question[source] ?? "").trim();
}

/**
 * The phases this question actually has, in order.
 *
 * Empty phases are dropped rather than rendered blank, and that is the rule
 * that keeps the real content working: a follow-up is optional at B2 — six of
 * the seven house Part 2s have one — so a question without one is a complete
 * question with a single phase, not a broken two-phase one. The same rule means
 * a level whose questions predate a phase being added simply runs without it.
 *
 * There is always at least one phase, because a question with no statement is
 * rejected long before it reaches here.
 *
 * `instructions` is the one piece of per-question phase labelling: C2's
 * collaborative task opens each phase by naming which photographs to look at,
 * which differs question by question and so cannot live in the blueprint. It is
 * indexed by phase, so instructions[1] labels the second phase.
 */
export function getQuestionPhases(
  level: string,
  part: string,
  question: PhasedQuestion
): QuestionPhase[] {
  const task = getCambridgeSpeakingTask(level, part);

  /* No blueprint means a level this build does not know about. One phase
     holding the statement is what every part has in common, so it is the right
     thing to fall back to rather than an empty runner. */
  if (!task) {
    return [
      {
        source: "statement",
        label: null,
        text: textFor(question, "statement"),
        seconds: 0
      }
    ];
  }

  return task.phases.flatMap((phase, index): QuestionPhase[] => {
    const text = textFor(question, phase.source);
    if (!text) return [];

    return [
      {
        source: phase.source,
        label: phase.label ?? question.instructions?.[index]?.trim() ?? null,
        text,
        seconds: phase.seconds
      }
    ];
  });
}
