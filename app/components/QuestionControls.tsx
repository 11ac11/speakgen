"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import styled from "styled-components";
import { Button } from "@/app/components/ui";
import Timer from "@/app/components/Timer";
import { getCambridgeSpeakingTask } from "@/lib/cambridgeBlueprints";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`;

const CenterControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const RightControl = styled.div`
  position: absolute;
  right: 0;
`;

const StyledButton = styled(Button)`
  button {
    border-radius: 8px;
    text-transform: uppercase;
    font-weight: 500;
    font-size: var(--text-xs);

    &:hover {
      filter: brightness(1.2);
    }
  }

  button:disabled {
    color: var(--off-text);
    background-color: var(--verylightgrey);

    &:hover {
      background-color: var(--verylightgrey);
      filter: unset;
    }
  }
`;

export const QuestionControls = ({
  part,
  question
}: {
  part: string;
  question: any;
}) => {
  const router = useRouter();
  const { level } = useParams();
  // Pushing the URL the page is already on is a no-op, so "Change Question"
  // did nothing. The page picks a new random question on each render, so what
  // it needs is a refetch.

  const suggestedSeconds =
    getCambridgeSpeakingTask(String(level), part)?.suggestedSeconds ?? 0;

  return (
    <Container>
      <CenterControls>
        <StyledButton
          onClick={() =>
            router.push(`/${level}/questions/random/${Number(part) - 1}`)
          }
          text={"Prev. part"}
          disabled={part === "1"}
        />
        <StyledButton
          onClick={() => router.refresh()}
          text={"Change Question"}
        />
        <StyledButton
          onClick={() =>
            router.push(`/${level}/questions/random/${Number(part) + 1}`)
          }
          text={"Next part"}
          disabled={level === "c2" ? part === "3" : part === "4"}
        />
      </CenterControls>
      <RightControl>
        <Timer timeLeft={suggestedSeconds} question={question} />
      </RightControl>
    </Container>
  );
};
