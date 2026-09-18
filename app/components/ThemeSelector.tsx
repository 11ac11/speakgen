"use client";

import React, { Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { THEME_VALUES_FOR_PILLS, type PillOption } from "@/constants";
import { Pill, Label } from "@/app/components/ui/index";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const ThemesWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const SelectedThemesWrap = styled(ThemesWrap)`
  min-height: 38px;
  align-items: center;
  margin-bottom: 30px;
`;

const PillsWrap = styled.div``;

/* An empty slot waiting to be filled, so it reads as an outline rather than a
   filled control: transparent, with a dashed edge. Its height matches the row
   of selected pills below, so nothing shifts when the first theme is added. */
const NoThemesSelectedWrap = styled.div`
  background: transparent;
  border: 1.5px dashed var(--field-edge);
  border-radius: var(--radius-control);
  padding: 0 1rem;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;

  & > p {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

export default function ThemeSelector({
  label,
  themes,
  setThemes
}: {
  label?: string;
  themes: string[];
  setThemes: Dispatch<SetStateAction<string[]>>;
}) {
  /* Derived, not state. It was a useState kept in step by a useEffect, which
     meant the first render always drew an empty list and the real one arrived
     a frame later. It is a filter of a constant — there is nothing to store. */
  const availableTags: PillOption[] = THEME_VALUES_FOR_PILLS.filter(
    (theme) => !themes.includes(theme.value)
  );

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
