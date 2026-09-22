import React, { type ReactNode } from "react";
import { Pill } from "@/app/components/ui";
import { THEME_VALUES_FOR_PILLS } from "@/constants";
import styled from "styled-components";

const Statement = styled.span<{ $smallFont?: boolean }>`
  font-size: ${(props) => (props.$smallFont ? "24px" : "32px")};
  margin: 0.5rem 1rem;
  font-weight: 500;
  white-space: pre-line;

  @media only screen and (max-width: 768px) {
    font-size: var(--text-base);
  }
`;

const ThemesContainer = styled.div`
  display: flex;
`;

/* Quieter than the statement on purpose: it is what the interlocutor says to
   set the task up, not the task itself. */
const Instruction = styled.span`
  margin: 0.5rem 1rem 0;
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
`;

/* Inside the card, under the words, separated by a hairline. The controls that
   move a question through its phases belong to the question rather than to the
   page around it: outside the card they had to sit somewhere, and every
   "somewhere" was wrong in one part or another — below two 40vh photographs at
   Part 2, and at Part 3 wedged between the statement and the last prompt,
   splitting the frame of prompts that surrounds it. */
const Footer = styled.div`
  width: 100%;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--field-edge);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

/**
 * The card at the top of a question: its themes, the interlocutor's line, the
 * words themselves, and whatever moves them on.
 *
 * It used to hold the reveal button for C2's second statement, along with the
 * state deciding which of the two was showing. The state has gone — a part can
 * have three phases whose words come from four different columns, and the one
 * that knows the order is the runner — but the button is back where it was,
 * because that turned out to be the only place that works in every part.
 */
export const StatementAndTheme = ({
  themes,
  statement,
  instruction,
  footer,
  smallFont = false
}: {
  themes: string[];
  statement: string;
  /** The interlocutor's line into this phase, where it has one. */
  instruction?: string | null;
  /** The phase controls, when the part has more than one phase. */
  footer?: ReactNode;
  smallFont?: boolean;
}) => {
  const renderPill = (value: string | undefined) => {
    const storedTheme = THEME_VALUES_FOR_PILLS.find((theme) =>
      theme.value.includes(value || "")
    );
    if (storedTheme) {
      return (
        <Pill
          key={storedTheme.value}
          text={storedTheme.label}
          bgColor={storedTheme.colors.bg}
          textColor={storedTheme.colors.text}
        />
      );
    }
  };

  return (
    <div className="themeCont glass">
      <ThemesContainer>
        {themes?.map((theme, index) => (
          <div key={index}>{renderPill(theme)}</div>
        ))}
      </ThemesContainer>
      {!!instruction && <Instruction>{instruction}</Instruction>}
      <Statement $smallFont={smallFont}>{statement}</Statement>
      {footer && <Footer>{footer}</Footer>}
    </div>
  );
};
