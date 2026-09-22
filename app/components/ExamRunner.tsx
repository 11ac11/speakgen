"use client";

import React, { useCallback, useState } from "react";
import styled from "styled-components";
import QuestionPhases from "@/app/components/QuestionPhases";
import Button from "@/app/components/ui/Button";
import Timer from "@/app/components/Timer";
import { Actions, Bar, Step, Steps } from "@/app/components/RunnerBar";
import type { Exam, ExamQuestion } from "@/lib/exams";
import { getCambridgeSpeakingTask } from "@/lib/cambridgeBlueprints";
import type { QuestionStructures } from "@/types/types";

const Meta = styled.span`
  font-weight: 400;
  font-size: var(--text-base);
  color: var(--text-muted);
`;

/**
 * Labels a step the way the test does. Part 2 runs twice, once per candidate,
 * so the candidate column becomes part of the label.
 */
function stepLabel(item: ExamQuestion) {
  const suffix = item.candidate === "-" ? "" : ` (${item.candidate})`;
  return `Part ${item.part}${suffix}`;
}

export default function ExamRunner({ exam }: { exam: Exam }) {
  const [index, setIndex] = useState(0);
  /* The timer follows the phase, not the part: a Part 2 long turn is a minute
     and then thirty seconds, and counting two minutes across both told the
     teacher nothing about either. QuestionPhases reports the phase it is on,
     and the key restarts the clock when it changes. */
  const [phase, setPhase] = useState({ seconds: 0, index: 0 });
  const onPhaseChange = useCallback(
    (seconds: number, phaseIndex: number) =>
      setPhase({ seconds, index: phaseIndex }),
    []
  );
  const current = exam.questions[index];

  if (!current) return <p>This exam has no questions yet.</p>;

  const task = getCambridgeSpeakingTask(exam.level, current.part);

  return (
    <div style={{ width: "100%" }}>
      <Bar>
        <Steps>
          {exam.questions.map((item, i) => (
            <Step
              key={`${item.part}-${item.candidate}`}
              className="glass"
              $active={i === index}
              onClick={() => setIndex(i)}
            >
              {stepLabel(item)}
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
            disabled={index === exam.questions.length - 1}
            onClick={() =>
              setIndex((i) => Math.min(exam.questions.length - 1, i + 1))
            }
          />
          {/* A guide to how long the part runs. It stops at zero and does
              nothing else: moving on is the teacher's call. */}
          <Timer
            seconds={phase.seconds || (task?.suggestedSeconds ?? 0)}
            resetKey={`${index}-${phase.index}`}
          />
        </Actions>
      </Bar>

      <h2 style={{ marginTop: 0 }}>
        {stepLabel(current)}
        {task ? ` — ${task.title}` : ""}
        {task ? (
          <Meta>{`  ·  ~${Math.round(task.suggestedSeconds / 60)} min`}</Meta>
        ) : null}
      </h2>

      {/* follow_up and decision used to be printed here, below the question and
          visible from the moment the part opened. They are phases of the task,
          not footnotes to it, so they are revealed in turn like everything
          else — see QuestionPhases. */}
      <QuestionPhases
        key={`${current.part}-${current.candidate}`}
        level={exam.level}
        part={current.part}
        question={current as unknown as QuestionStructures}
        onPhaseChange={onPhaseChange}
      />
    </div>
  );
}
