"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/timer.module.css";
import { QuestionStructures } from "../types/types";

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

  // console.log("timeLeft:", timeLeft);
  // console.log("seconds:", seconds);

  return (
    <div className={styles.timerBox}>
      <p className={styles.timerFont}>{seconds.toString()}</p>
    </div>
  );
};

export default CountdownTimer;
