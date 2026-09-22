"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/app/components/ui";
import Timer from "@/app/components/Timer";
import { Actions, Bar, Step, Steps } from "@/app/components/RunnerBar";
import { getCambridgeSpeakingTask } from "@/lib/cambridgeBlueprints";
import { getQuestionPartOptions } from "@/constants";

export const QuestionControls = ({
  part,
  question,
  seconds,
  phaseIndex = 0
}: {
  part: string;
  question: any;
  /** The current phase's length, from the runner above. */
  seconds?: number;
  phaseIndex?: number;
}) => {
  const router = useRouter();
  const { level } = useParams();
  const levelCode = String(level);

  /* The phase's length when the runner has one, the whole part otherwise —
     which is what a part with a single phase amounts to anyway. */
  const suggestedSeconds =
    seconds ||
    (getCambridgeSpeakingTask(levelCode, part)?.suggestedSeconds ?? 0);

  // C2 has three parts, the other levels four. QUESTION_LEVELS mirrors
  // content.level_parts, so this reads the shape rather than restating it.
  const parts = getQuestionPartOptions(levelCode);

  return (
    <Bar>
      {/* Was a Prev/Next pair, which made reaching Part 4 from Part 1 three
          clicks and never showed where you were. Same step pills as the exam
          runner, so the two screens read alike. */}
      <Steps>
        {parts.map((p) => (
          <Step
            key={p}
            className="glass"
            $active={p === part}
            onClick={() => router.push(`/${levelCode}/questions/random/${p}`)}
          >
            {`Part ${p}`}
          </Step>
        ))}
      </Steps>

      <Actions>
        {/* Pushing the URL the page is already on is a no-op, so this has to
            refetch rather than navigate: the page picks a new random question
            on each render. */}
        <Button
          text="Change question"
          secondary
          onClick={() => router.refresh()}
        />
        <Timer
          seconds={suggestedSeconds}
          resetKey={`${question?.id ?? part}-${phaseIndex}`}
        />
      </Actions>
    </Bar>
  );
};
