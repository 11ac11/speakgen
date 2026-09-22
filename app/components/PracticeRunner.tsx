"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import QuestionPhases from "@/app/components/QuestionPhases";
import Button from "@/app/components/ui/Button";
import Timer from "@/app/components/Timer";
import { Actions, Bar, Step, Steps } from "@/app/components/RunnerBar";
import type { Practice } from "@/lib/practices";
import { getCambridgeSpeakingTask } from "@/lib/cambridgeBlueprints";
import type { QuestionStructures } from "@/types/types";

const Meta = styled.span`
  font-weight: 400;
  font-size: var(--text-base);
  color: var(--text-muted);
`;

/**
 * The same runner as an exam, over a drawn set rather than filled slots.
 *
 * The steps are numbered rather than labelled by part, because a mixed practice
 * can hold three Part 1s in a row and "Part 1, Part 1, Part 1" says nothing
 * about where you are. The part belongs to the question, so it goes in the
 * heading with the task's name.
 */
export default function PracticeRunner({ practice }: { practice: Practice }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [redrawing, setRedrawing] = useState(false);
  // As in the exam runner: the clock belongs to the phase, not the part.
  const [phase, setPhase] = useState({ seconds: 0, index: 0 });
  const onPhaseChange = useCallback(
    (seconds: number, phaseIndex: number) =>
      setPhase({ seconds, index: phaseIndex }),
    []
  );

  const current = practice.questions[index];

  if (!current) {
    return (
      <p>
        {`Nothing matches this practice at the moment. Write more ${practice.level.toUpperCase()} questions and it will fill again.`}
      </p>
    );
  }

  const task = getCambridgeSpeakingTask(practice.level, current.part);

  /* A practice is a rule, so a new set is one request away. refresh() re-runs
     the server component, which draws again — the practice itself does not
     change, which is why this is not a mutation. */
  const redraw = () => {
    setRedrawing(true);
    setIndex(0);
    router.refresh();
    // The refresh resolves on the server; clearing the flag on the next paint
    // is close enough for a button that is disabled for a moment.
    setTimeout(() => setRedrawing(false), 600);
  };

  return (
    <div style={{ width: "100%" }}>
      <Bar>
        <Steps>
          {practice.questions.map((item, i) => (
            <Step
              key={item.id}
              className="glass"
              $active={i === index}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </Step>
          ))}
        </Steps>
        <Actions>
          <Button
            text="Back"
            secondary
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          />
          <Button
            text="Next"
            disabled={index === practice.questions.length - 1}
            onClick={() =>
              setIndex((i) => Math.min(practice.questions.length - 1, i + 1))
            }
          />
          <Timer
            seconds={phase.seconds || (task?.suggestedSeconds ?? 0)}
            resetKey={`${index}-${phase.index}`}
          />
        </Actions>
      </Bar>

      <h2 style={{ marginTop: 0 }}>
        {`Part ${current.part}`}
        {task ? ` — ${task.title}` : ""}
        <Meta>{`  ·  ${index + 1} of ${practice.questions.length}`}</Meta>
      </h2>

      <QuestionPhases
        key={current.id}
        level={practice.level}
        part={current.part}
        question={current as unknown as QuestionStructures}
        onPhaseChange={onPhaseChange}
      />

      <div style={{ marginTop: "2rem" }}>
        <Button
          text={redrawing ? "Drawing…" : "Draw a new set"}
          secondary
          disabled={redrawing}
          onClick={redraw}
        />
      </div>
    </div>
  );
}
