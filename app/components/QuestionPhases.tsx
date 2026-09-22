"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Question from "@/app/components/Question";
import Button from "@/app/components/ui/Button";
import { getQuestionPhases, type PhasedQuestion } from "@/lib/examPhases";
import type { QuestionStructures } from "@/types/types";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

/* "2 of 3", beside the buttons. Small, because it answers a question nobody is
   asking urgently — but without it a part that has advanced looks exactly like
   a part that has only one phase. */
const Position = styled.span`
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

/**
 * A question, run one phase at a time.
 *
 * The problem this solves is that everything used to be on screen at once. A B2
 * long turn printed the question the *other* candidate is about to be asked
 * directly under the photographs, so it was readable throughout the first
 * candidate's minute — by the one person in the room who should not see it. The
 * collaborative tasks did the same with their decision: the pair could read
 * where they were meant to end up before they had begun discussing.
 *
 * Only C2's Part 2 revealed anything, behind a button buried in the statement
 * card, and only because its second phase happened to live in its own column.
 * That button is this component now, and every part gets it.
 *
 * Phases replace rather than stack. Once the long turn is over the long turn's
 * question is done with, and a stack of finished prompts on a projector is
 * clutter at exactly the moment the room needs to read one line. Back is there
 * for when somebody moved on too early.
 */
export default function QuestionPhases({
  level,
  part,
  question,
  onPhaseChange
}: {
  level: string;
  part: string;
  question: PhasedQuestion & QuestionStructures;
  /**
   * Lets the runner above drive its timer from the phase rather than the part:
   * a B2 long turn is a minute and then thirty seconds, not two minutes of
   * nothing in particular.
   */
  onPhaseChange?: (seconds: number, index: number) => void;
}) {
  const phases = useMemo(
    () => getQuestionPhases(level, part, question),
    [level, part, question]
  );

  const [index, setIndex] = useState(0);

  /* Back to the first phase whenever the content changes, so that stepping from
     a three-phase Part 3 to a one-phase Part 1 does not land on a phase that
     does not exist, and redrawing a practice does not open the new question
     half way through.

     Adjusted during render rather than in an effect, which is what React asks
     for when state has to follow a prop: an effect would paint the new question
     at the old phase first and correct it afterwards.

     Keyed on the phases themselves rather than on a question id, because that
     is what the index actually indexes. Content that has not changed keeps its
     place — which is what you want when a re-render is just a re-render. */
  const signature = `${level}|${part}|${phases.map((p) => p.text).join("¦")}`;
  const [seen, setSeen] = useState(signature);
  if (seen !== signature) {
    setSeen(signature);
    setIndex(0);
  }

  /* Clamped rather than trusted: phases is derived from the question, so the
     two change together and a stale index would read past the end for a frame. */
  const safeIndex = Math.min(index, Math.max(0, phases.length - 1));
  const current = phases[safeIndex];

  useEffect(() => {
    if (current) onPhaseChange?.(current.seconds, safeIndex);
  }, [current, safeIndex, onPhaseChange]);

  if (!current) return null;

  const hasMore = safeIndex < phases.length - 1;
  const next = phases[safeIndex + 1];

  return (
    <>
      <Question
        question={question}
        part={part}
        statement={current.text}
        instruction={current.label}
      />

      {/* Nothing at all when the part has one phase, which is most of Part 1
          and every Part 4: a lone disabled button under an interview question
          is a control that does nothing but look broken. */}
      {phases.length > 1 && (
        <Controls>
          {/* "Back a step", not "Back": the toolbar above has a Back of its
              own that moves to the previous part, and two buttons reading
              "Back" on one screen is a coin toss in the middle of an exam. */}
          <Button
            text="Back a step"
            secondary
            disabled={safeIndex === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          />
          {hasMore && (
            /* Named, not just "Continue". The teacher is reading this off a
               projector mid-exam and the useful question is what happens next,
               which is the thing the label was written to answer. */
            <Button
              text={next?.label ? `Continue — ${next.label}` : "Continue"}
              onClick={() =>
                setIndex((i) => Math.min(phases.length - 1, i + 1))
              }
            />
          )}
          <Position>{`${safeIndex + 1} of ${phases.length}`}</Position>
        </Controls>
      )}
    </>
  );
}
