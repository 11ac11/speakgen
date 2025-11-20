import React, { useEffect, useState } from "react";
import { Pill, Button } from "@/app/components/ui";
import { THEME_VALUES_FOR_PILLS } from "@/constants";
import styled from "styled-components";

const Statement = styled.span<{ $smallFont?: boolean }>`
  font-size: ${(props) => (props.$smallFont ? "24px" : "32px")};
  margin: 0.5rem 1rem;
  font-weight: 700;
  white-space: pre-line;

  @media only screen and (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ThemesContainer = styled.div`
  display: flex;
`;

export const StatementAndTheme = ({
  themes,
  statement,
  statementTwo,
  smallFont = false,
}: {
  themes: string[];
  statement: string;
  statementTwo?: string;
  smallFont?: boolean;
}) => {
  const [statementToView, setStatementToView] = useState(statement);

  useEffect(() => {
    setStatementToView(statement);
  }, [statement]);

  const renderPill = (value: string | undefined) => {
    const storedTheme = THEME_VALUES_FOR_PILLS.find((theme) =>
      theme.value.includes(value || ""),
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
