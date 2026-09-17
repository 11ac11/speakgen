"use client";

import styled from "styled-components";

/**
 * The toolbar above a question, shared by the exam runner and the random
 * question page. They were drawn separately and drifted: one had uppercase
 * 8px buttons with a brightness hover, the other the design system's. Steps on
 * the left, actions on the right, in both.
 */
export const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 1.5rem;
`;

export const Steps = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// A button does not inherit colour from its parent: without an explicit value
// it takes the browser's own button colour, which is near-white when the OS is
// in dark mode and disappears against the translucent card. Every button in
// this codebase has to set its own colour, as StyledButton in ui/Button does.
export const Step = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  border-radius: var(--radius-pill);
  padding: 0.35rem 0.9rem;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-body);
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
  transition: opacity 0.12s ease;

  &:hover {
    opacity: ${(props) => (props.$active ? 1 : 0.85)};
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
