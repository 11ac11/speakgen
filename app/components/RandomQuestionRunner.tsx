"use client";

import React, { useCallback, useState } from "react";
import QuestionPhases from "@/app/components/QuestionPhases";
import { QuestionControls } from "@/app/components/QuestionControls";
import type { QuestionStructures } from "@/types/types";

/**
 * The random question page's toolbar and question, in one client component.
 *
 * It exists only to hold the phase between the two. The toolbar carries the
 * timer and the question carries the phase, and without something owning both
 * the timer on this page would count the whole part while the exam and practice
 * runners count the phase — the same question, timed two different ways
 * depending on how you arrived at it.
 */
export default function RandomQuestionRunner({
  level,
  part,
  question
}: {
  level: string;
  part: string;
  question: QuestionStructures;
}) {
  const [phase, setPhase] = useState({ seconds: 0, index: 0 });

  const onPhaseChange = useCallback(
    (seconds: number, index: number) => setPhase({ seconds, index }),
    []
  );

  return (
    <>
      <QuestionControls
        question={question}
        part={part}
        seconds={phase.seconds}
        phaseIndex={phase.index}
      />
      {/* A single random question still runs in phases: draw a B2 Part 2 here
          and the follow-up for the other candidate is a click away rather than
          sitting under the photographs from the start, exactly as in an exam. */}
      <QuestionPhases
        level={level}
        part={part}
        question={question}
        onPhaseChange={onPhaseChange}
      />
    </>
  );
}
