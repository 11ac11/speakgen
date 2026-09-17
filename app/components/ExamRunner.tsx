"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Question from "@/app/components/Question";
import Button from "@/app/components/ui/Button";
import Timer from "@/app/components/Timer";
import { Actions, Bar, Step, Steps } from "@/app/components/RunnerBar";
import type { Exam, ExamQuestion } from "@/lib/exams";
import { getCambridgeSpeakingTask } from "@/lib/cambridgeBlueprints";
import type { QuestionStructures } from "@/types/types";

const Interlocutor = styled.div`
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--text-body);

  strong {
    display: block;
    text-transform: uppercase;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 0.35rem;
  }
`;

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
          <Timer seconds={task?.suggestedSeconds ?? 0} resetKey={index} />
        </Actions>
      </Bar>

      <h2 style={{ marginTop: 0 }}>
        {stepLabel(current)}
        {task ? ` — ${task.title}` : ""}
        {task ? (
          <Meta>{`  ·  ~${Math.round(task.suggestedSeconds / 60)} min`}</Meta>
        ) : null}
      </h2>

      <Question
        question={current as unknown as QuestionStructures}
        part={current.part}
      />

      {/*
        follow_up and decision are printed parts of the real task that the
        Question component does not render: the 30-second question the other
        candidate answers in Part 2, and the second-phase decision task in
        Part 3. They are shown here as interlocutor notes.
      */}
      {current.follow_up ? (
        <Interlocutor className="glass">
          <strong>Then ask the other candidate (about 30 seconds)</strong>
          {current.follow_up}
        </Interlocutor>
      ) : null}

      {current.decision ? (
        <Interlocutor className="glass">
          <strong>Then, after about two minutes (about one minute)</strong>
          {current.decision}
        </Interlocutor>
      ) : null}
    </div>
  );
}
