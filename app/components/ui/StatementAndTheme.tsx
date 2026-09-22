import React from "react";
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

/**
 * The card at the top of a question: its themes, the interlocutor's line, and
 * the words themselves.
 *
 * It used to hold the reveal button for C2's second statement, along with the
 * state deciding which of the two was showing. Both have gone: a part can have
 * three phases rather than two, whose words come from four different columns,
 * and the one that knows the order is the runner. This component now shows
 * whatever it is handed, which is also what makes it usable for a phase that is
 * not a statement at all.
 */
export const StatementAndTheme = ({
  themes,
  statement,
  instruction,
  smallFont = false
}: {
  themes: string[];
  statement: string;
  /** The interlocutor's line into this phase, where it has one. */
  instruction?: string | null;
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
    </div>
  );
};
