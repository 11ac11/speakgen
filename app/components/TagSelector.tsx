"use client";

import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import styled from "styled-components";
import { THEME_VALUES_FOR_PILLS } from "@/constants";
import { Pill } from "@/app/components/ui/index";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 10px;
  font-size: 18px;
`;

const TagsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 30px;
`;

const SelectedTagsWrap = styled(TagsWrap)`
  height: 30px;
`;

const PillsWrap = styled.div``;

const NoTagsSelectedWrap = styled.div`
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
    color: rgb(161, 161, 161);
  }
`;

export default function TagSelector({
  label,
  tags,
  setTags,
}: {
  label?: string;
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
}) {
  const [availableTags, setAvailableTags] = useState<any[]>([]); // TODO: fix any

  useEffect(() => {
    const filteredTags = THEME_VALUES_FOR_PILLS.filter(
      (theme) => !tags.includes(theme.value)
    );
    setAvailableTags(filteredTags);
  }, [tags]);

  const handleOnClickAdd = (theme: string) => {
    if (tags.includes(theme)) {
      return;
    }
    setTags([...tags, theme]);
  };

  const handleOnClickRemove = (theme: string) => {
    const updatedTags = tags.filter((tag) => tag !== theme);

    setTags(updatedTags);
  };

  return (
    <Wrap>
      {label && <Label>{label}</Label>}
      {tags.length > 0 ? (
        <SelectedTagsWrap>
          <PillsWrap>
            {tags.map((tag) => {
              const fullTag = THEME_VALUES_FOR_PILLS.find(
                (theme) => theme.value === tag
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
        </SelectedTagsWrap>
      ) : (
        <NoTagsSelectedWrap>
          <p>No tags selected</p>
        </NoTagsSelectedWrap>
      )}
      <TagsWrap>
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
      </TagsWrap>
    </Wrap>
  );
}
