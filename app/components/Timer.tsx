"use client";

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { QuestionStructures } from "@/types/types";

const TimerBox = styled.div`
  position: absolute;
  align-self: center;
  right: 0;
  z-index: 2;

  & > span {
    font-size: 3rem;
    color: white;
    font-variant-numeric: tabular-nums;
  }

  @media only screen and (max-width: 1000px) {
    right: 1rem;
  }

  @media only screen and (max-width: 768px) {
    & > span {
      font-size: 2rem;
    }
  }
`;

const CountdownTimer = ({
  timeLeft,
  question,
}: {
  timeLeft: number;
  question: QuestionStructures | String | undefined;
}) => {
  const [seconds, setSeconds] = useState(timeLeft);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset the timer whenever timeLeft changes
    setSeconds(timeLeft);
  }, [question, timeLeft]); // Effect triggers when 'timeLeft' changes

  useEffect(() => {
    if (seconds === 0) return; // Stop when countdown reaches 0

    // Set the timer
    timerRef.current = setInterval(() => {
      setSeconds((prev: number) => prev - 1);
    }, 1000);

    // Clean up the timer on component unmount or when seconds change
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [seconds]); // Effect triggers when 'seconds' change

  return (
    <TimerBox>
      <span>{seconds.toString()}</span>
    </TimerBox>
  );
};

export default CountdownTimer;
