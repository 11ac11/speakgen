import React, { useEffect, useState } from "react";
import { Pill, Button } from "@/app/components/ui";
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

export const StatementAndTheme = ({
  themes,
  statement,
  statementTwo,
  instructions,
  smallFont = false
}: {
  themes: string[];
  statement: string;
  statementTwo?: string;
  /* C2 Part 2 runs in two phases over one set of photographs, and each phase
     opens with its own line: "Look at photographs one and two", then "Now look
     at all the photographs". They are indexed to match the statement being
     shown, so the instruction changes with it. Every other part has none. */
  instructions?: string[];
  smallFont?: boolean;
}) => {
  const [statementToView, setStatementToView] = useState(statement);
  const showingSecond = !!statementTwo && statementToView === statementTwo;
  const instruction = instructions?.[showingSecond ? 1 : 0];

  useEffect(() => {
    setStatementToView(statement);
  }, [statement]);

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
      <Statement $smallFont={smallFont}>{statementToView}</Statement>
      {!!statementTwo && statementToView !== statementTwo && (
        <Button
          text={"Continue to second part of question"}
          onClick={() => setStatementToView(statementTwo)}
        ></Button>
      )}
    </div>
  );
};
