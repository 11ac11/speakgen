"use client";

import Link from "next/link";
import styled from "styled-components";
import type {
  CambridgeInteraction,
  CambridgeSpeakingBlueprint,
  CambridgePhaseSource
} from "@/lib/cambridgeBlueprints";

const Parts = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: grid;
  gap: 1rem;
`;

const Part = styled.li`
  padding: 1.5rem;
  border-radius: var(--radius-card);
  border: 1px solid var(--field-edge);
  background: #fff;
`;

/* The part number leads, because a teacher arriving here is looking for a part
   rather than reading the page through. */
const PartHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;

  h2 {
    font-size: var(--text-lg);
    margin: 0;
  }

  span.number {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--green-600);
  }
`;

/* Time, who speaks, and whether it runs twice — the three things you check
   before starting a part, so they sit together above the prose. */
const Facts = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0.9rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;

  li {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-body);
    background: var(--green-tint);
    border: 1px solid var(--green-edge);
    border-radius: var(--radius-pill);
    padding: 0.25rem 0.7rem;
  }
`;

const Guidance = styled.p`
  font-size: var(--text-sm);
  color: var(--text-body);
  margin: 0 0 0.9rem;
`;

const Carries = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
`;

/* Only drawn when a part has more than one phase, which is the question this
   page exists to answer for anyone who has met the runner's Continue button
   and wondered what is behind it. */
const Steps = styled.ol`
  margin: 0.9rem 0 0;
  padding: 0.9rem 0 0 1.2rem;
  border-top: 1px solid var(--field-edge);

  li {
    font-size: var(--text-sm);
    color: var(--text-body);
    margin-bottom: 0.3rem;
  }

  li:last-child {
    margin-bottom: 0;
  }

  span.time {
    color: var(--text-muted);
  }
`;

const Footnote = styled.p`
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 2rem 0 0;
`;

const Links = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const Action = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: var(--control-height);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-control);
  font-size: var(--text-sm);
  font-weight: 500;
  background: var(--green-600);
  color: #fff;
  box-shadow: 0 3px 0 0 var(--green-800);

  &:hover {
    color: #fff;
    background: var(--green-500);
  }

  &.secondary {
    background: #fff;
    color: var(--green-600);
    border: 1.5px solid var(--green-edge);
    box-shadow: 0 3px 0 0 #e4ebe2;
  }

  &.secondary:hover {
    background: var(--green-tint);
    color: var(--green-600);
  }
`;

/* Written out rather than derived from contentType, because "who is talking"
   and "what the question carries" are different questions and the second does
   not answer the first. */
const WHO: Record<CambridgeInteraction, string> = {
  interview: "The examiner asks each candidate",
  individual: "One candidate speaks alone",
  pair: "The two candidates talk to each other",
  discussion: "Both candidates, with the examiner"
};

/* A phase's own label where it has one. Where it does not, it is either the
   task itself or — at C2's collaborative task — a line written per question
   naming which photographs to look at, which this page cannot know. */
const PHASE_FALLBACK: Record<CambridgePhaseSource, string> = {
  statement: "The task itself",
  statement_two: "The second part of the task",
  follow_up: "A question for the other candidate",
  decision: "The decision"
};

/** 90 → "1 min 30 sec", 120 → "2 min", 30 → "30 sec". */
function duration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (!minutes) return `${rest} sec`;
  return rest ? `${minutes} min ${rest} sec` : `${minutes} min`;
}

export default function LevelInstructions({
  blueprint,
  levelCode,
  levelLabel,
  minutes
}: {
  blueprint: CambridgeSpeakingBlueprint;
  levelCode: string;
  levelLabel: string;
  minutes: number;
}) {
  return (
    <>
      <Parts>
        {blueprint.tasks.map((task) => (
          <Part key={task.part}>
            <PartHead>
              <span className="number">{`Part ${task.part}`}</span>
              <h2>{task.title}</h2>
            </PartHead>

            <Facts>
              <li>{duration(task.suggestedSeconds)}</li>
              <li>{WHO[task.interaction]}</li>
              {/* The doubled part is different at C2, so this is read off the
                  task rather than assumed to be Part 2. */}
              {task.perCandidate ? (
                <li>Runs twice, once per candidate</li>
              ) : null}
            </Facts>

            <Guidance>{task.candidateGuidance}</Guidance>

            {task.images || task.prompts ? (
              <Carries>
                {task.images
                  ? task.images.min === task.images.max
                    ? `${task.images.min} photograph${task.images.min === 1 ? "" : "s"}`
                    : `${task.images.min}–${task.images.max} photographs`
                  : null}
                {task.images && task.prompts ? ", " : null}
                {task.prompts
                  ? `${task.prompts.min}–${task.prompts.max} written prompts`
                  : null}
              </Carries>
            ) : null}

            {task.phases.length > 1 ? (
              <Steps>
                {task.phases.map((phase) => (
                  <li key={phase.source}>
                    {phase.label ?? PHASE_FALLBACK[phase.source]}
                    <span className="time">{` — ${duration(phase.seconds)}`}</span>
                  </li>
                ))}
              </Steps>
            ) : null}
          </Part>
        ))}
      </Parts>

      <Footnote>
        {`About ${minutes} minutes in total for a pair of candidates. The timings are a guide — the timer on each question counts the part down, and moving on is always your call.`}
      </Footnote>

      <Links>
        <Action
          href={`/${levelCode}/exams`}
        >{`Free ${levelLabel} exams`}</Action>
        <Action
          className="secondary"
          href={`/${levelCode}/questions/random/1`}
        >{`Draw a single question`}</Action>
      </Links>
    </>
  );
}
