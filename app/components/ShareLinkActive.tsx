"use client";

import React from "react";
import styled, { css } from "styled-components";
import LinkIcon from "@/app/components/ui/LinkIcon";
import TickIcon from "@/app/components/ui/TickIcon";

/**
 * "Share link active": the one way the product says a share link is live.
 *
 * Used on the dashboard card, as a badge, and on the exam and practice page,
 * as the button that opens the share panel. One component rather than two
 * look-alikes, so the words, the icons and the tick cannot drift apart —
 * which is what two separate spellings of this had already started to do.
 *
 * Green like the rest of the "this is on" signals, with the tick as well as
 * the colour so the state does not depend on telling green from grey.
 */

const pill = css`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  border-radius: var(--radius-pill);
  background: var(--green-tint);
  border: 1px solid var(--green-edge);
  color: var(--green-600);
  font-family: var(--font-body), sans-serif;
  font-weight: 600;
  white-space: nowrap;
`;

const Badge = styled.span`
  && {
    ${pill}
    padding: 0.15rem 0.55rem;
    font-size: var(--text-xs);
  }
`;

/* The same pill at button height, so it lines up with the controls beside
   it, and with the button's lift. It must set its own colour: a button does
   not inherit one, as RunnerBar explains. */
const Toggle = styled.button`
  ${pill}
  min-height: var(--control-height);
  padding: 0.5rem 1rem;
  font-size: var(--text-sm);
  cursor: pointer;
  transition:
    transform 0.12s var(--lift),
    border-color 0.12s ease;

  &:hover {
    border-color: var(--leafgreen);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }
`;

const TEXT = "Share link active";

export default function ShareLinkActive({
  onClick,
  expanded
}: {
  /** Makes it the button that opens the share panel. Without it, a badge. */
  onClick?: () => void;
  expanded?: boolean;
}) {
  if (onClick) {
    return (
      <Toggle type="button" onClick={onClick} aria-expanded={expanded}>
        <LinkIcon size={14} />
        {TEXT}
        <TickIcon size={14} />
      </Toggle>
    );
  }

  return (
    <Badge title="Anyone with the link can run this">
      <LinkIcon size={12} />
      {TEXT}
      <TickIcon size={12} />
    </Badge>
  );
}
