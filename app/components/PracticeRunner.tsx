"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Question from "@/app/components/Question";
import Button from "@/app/components/ui/Button";
import Timer from "@/app/components/Timer";
import { Actions, Bar, Step, Steps } from "@/app/components/RunnerBar";
import type { Practice } from "@/lib/practices";
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
          <Timer seconds={task?.suggestedSeconds ?? 0} resetKey={index} />
        </Actions>
      </Bar>

      <h2 style={{ marginTop: 0 }}>
        {`Part ${current.part}`}
        {task ? ` — ${task.title}` : ""}
        <Meta>{`  ·  ${index + 1} of ${practice.questions.length}`}</Meta>
      </h2>

      <Question
        question={current as unknown as QuestionStructures}
        part={current.part}
      />

      {current.follow_up && task?.followUpLabel ? (
        <Interlocutor className="glass">
          <strong>{task.followUpLabel}</strong>
          {current.follow_up}
        </Interlocutor>
      ) : null}

      {current.decision && task?.decisionLabel ? (
        <Interlocutor className="glass">
          <strong>{task.decisionLabel}</strong>
          {current.decision}
        </Interlocutor>
      ) : null}

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
