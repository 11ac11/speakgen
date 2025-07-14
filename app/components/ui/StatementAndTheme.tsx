import { Pill } from "@/app/components/ui";
import { THEME_VALUES_FOR_PILLS } from "@/constants";
import styled from "styled-components";

const Statement = styled.span`
  font-size: 2rem;
  margin: 0.5rem 1rem;
  font-weight: 700;

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
}: {
  themes: string[];
  statement: string;
}) => {
  console.log("themes:", themes);
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
      <Statement>{statement}</Statement>
    </div>
  );
};
