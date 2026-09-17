"use client";

import styled from "styled-components";

type StyledTabProps = {
  $isActive?: boolean;
};

/* A button, not a div: it is a click target with a state, and it needs to be
   reachable by Tab and operable by Enter. */
const StyledTab = styled.button<StyledTabProps>`
  appearance: none;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.7rem 0.15rem;
  /* Sits on the strip's own rule, so the indicator lines up with it. */
  margin-bottom: -1px;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  color: ${({ $isActive }) =>
    $isActive ? "var(--text-heading)" : "var(--text-muted)"};
  border-bottom: 2px solid
    ${({ $isActive }) => ($isActive ? "var(--green-600)" : "transparent")};
  transition:
    color 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    color: var(--text-heading);
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }
`;

export default function Tab({
  isActive,
  text,
  onClick
}: {
  isActive: boolean;
  text: string;
  onClick: () => void;
}) {
  return (
    <StyledTab
      type="button"
      role="tab"
      aria-selected={isActive}
      $isActive={isActive}
      onClick={onClick}
    >
      {text}
    </StyledTab>
  );
}
