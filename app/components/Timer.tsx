"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Box = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
`;

const Time = styled.span<{ $done: boolean; $running: boolean }>`
  font-family: var(--font-display), sans-serif;
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  /* Without this the digits are different widths, so the whole toolbar shifts
     left and right once a second. */
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: ${({ $done, $running }) =>
    $done
      ? "var(--danger)"
      : $running
        ? "var(--text-heading)"
        : "var(--text-faint)"};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  button {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-body), sans-serif;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  button:hover {
    color: var(--green-600);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  span {
    font-size: var(--text-xs);
    color: var(--text-faint);
  }
`;

function format(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * The suggested length of the current task, counted down.
 *
 * It is a guide and nothing more: reaching zero stops the clock and colours it,
 * and does not advance the exam or change the question. A teacher decides when
 * the candidate has finished, not this.
 */
export default function Timer({
  seconds: allowed,
  resetKey
}: {
  seconds: number;
  /** Changing this restarts the clock: the step or question it belongs to. */
  resetKey: string | number;
}) {
  const [left, setLeft] = useState(allowed);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLeft(allowed);
    setRunning(true);
  }, [allowed, resetKey]);

  useEffect(() => {
    if (!running || left <= 0) return;

    intervalRef.current = setInterval(
      () => setLeft((prev) => Math.max(0, prev - 1)),
      1000
    );

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, left]);

  const reset = useCallback(() => {
    setLeft(allowed);
    setRunning(true);
  }, [allowed]);

  if (!allowed) return null;

  const done = left === 0;

  return (
    <Box>
      <Time
        $done={done}
        $running={running && !done}
        role="timer"
        aria-live="off"
      >
        {format(left)}
      </Time>
      <Controls>
        {done ? (
          <span>Time is up — a guide only</span>
        ) : (
          <button type="button" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </button>
        )}
        <button type="button" onClick={reset}>
          Reset
        </button>
      </Controls>
    </Box>
  );
}
