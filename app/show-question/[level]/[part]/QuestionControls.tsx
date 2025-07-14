"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styled from "styled-components";
import { Button } from "@/app/components/ui";
import Timer from "@/app/components/Timer";

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
    font-weight: 700;
    font-size: 12px;

    &:hover {
      filter: brightness(1.2);
    }
  }

  button:disabled {
    color: #bababa;
    background-color: var(--verylightgrey);

    &:hover {
      background-color: var(--verylightgrey);
      filter: unset;
    }
  }
`;

export const QuestionControls = ({
  part,
  question,
}: {
  part: string;
  question: any;
}) => {
  const router = useRouter();
  const { level } = useParams();

  const returnPartTimes = (part: string) => {
    switch (part) {
      case "1":
        return 60;
      case "2":
        return 120;
      case "3":
        return 180;
      case "4":
        return 180;
      default:
        return 0;
    }
  };

  return (
    <Container>
      <CenterControls>
        <StyledButton
          onClick={() =>
            router.push(`/show-question/${level}/${Number(part) - 1}`)
          }
          text={"Prev. part"}
          disabled={part === "1"}
        />
        <StyledButton
          onClick={() => router.push(`/show-question/${level}/${part}`)}
          text={"Change Question"}
        />
        <StyledButton
          onClick={() =>
            router.push(`/show-question/${level}/${Number(part) + 1}`)
          }
          text={"Next part"}
          disabled={level === "c2" ? part === "3" : part === "4"}
        />
      </CenterControls>
      <RightControl>
        <Timer timeLeft={returnPartTimes(part)} question={question} />
      </RightControl>
    </Container>
  );
};
