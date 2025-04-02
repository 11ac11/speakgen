"use client";

import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import styled from "styled-components";
import { THEME_VALUES_FOR_PILLS } from "@/constants";
import { Pill, Label } from "@/app/components/ui/index";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const ThemesWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 30px;
`;

const SelectedThemesWrap = styled(ThemesWrap)`
  height: 30px;
`;

const PillsWrap = styled.div``;

const NoThemesSelectedWrap = styled.div`
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 0 1rem;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;

  & > p {
    font-size: 14px;
    color: #a1a1a1;
  }
`;

export default function ThemeSelector({
  label,
  themes,
  setThemes,
}: {
  label?: string;
  themes: string[];
  setThemes: Dispatch<SetStateAction<string[]>>;
}) {
  const [availableTags, setAvailableTags] = useState<any[]>([]); // TODO: fix any

  useEffect(() => {
    const filteredTags = THEME_VALUES_FOR_PILLS.filter(
      (theme) => !themes.includes(theme.value)
    );
    setAvailableTags(filteredTags);
  }, [themes]);

  const handleOnClickAdd = (newTheme: string) => {
    if (themes.includes(newTheme)) {
      return;
    }
    setThemes([...themes, newTheme]);
  };

  const handleOnClickRemove = (theme: string) => {
    const updatedTags = themes.filter((tag) => tag !== theme);

    setThemes(updatedTags);
  };

  return (
    <Wrap>
      {label && <Label text={label} />}
      {themes.length > 0 ? (
        <SelectedThemesWrap>
          <PillsWrap>
            {themes.map((theme) => {
              const fullTag = THEME_VALUES_FOR_PILLS.find(
                (storedTheme) => storedTheme.value === theme
              );
              if (fullTag) {
                return (
                  <Pill
                    key={fullTag.value}
                    bgColor={fullTag.colors.bg}
                    textColor={fullTag.colors.text}
                    text={fullTag.label}
                    onClick={() => handleOnClickRemove(fullTag.value)}
                    showRemove={true}
                    style={{ cursor: "pointer" }}
                  />
                );
              }
            })}
          </PillsWrap>
        </SelectedThemesWrap>
      ) : (
        <NoThemesSelectedWrap>
          <p>No themes selected</p>
        </NoThemesSelectedWrap>
      )}
      <ThemesWrap>
        {availableTags?.map((theme) => {
          return (
            <Pill
              key={theme.value}
              bgColor={theme.colors.bg}
              textColor={theme.colors.text}
              text={theme.label}
              onClick={() => handleOnClickAdd(theme.value)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </ThemesWrap>
    </Wrap>
  );
}
