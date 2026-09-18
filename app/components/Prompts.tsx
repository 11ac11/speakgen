import React from "react";
import styled from "styled-components";
import { Input } from "@/app/components/ui";

const Wrap = styled.div`
  max-width: 500px;
  width: 100%;

  & p {
    margin-bottom: 5px;
    font-size: var(--text-lg);
  }
`;

const PromptContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
`;

const StyledInput = styled(Input)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 220px;

  & label {
    font-size: var(--text-sm);
    margin-bottom: 0;
  }
`;

const Prompts = ({
  prompts,
  setPrompts,
  placeholders
}: {
  prompts: string[];
  setPrompts: React.Dispatch<React.SetStateAction<string[]>>; // Correct type for setState
  placeholders: string[];
}) => {
  const paddedPrompts = [...prompts, ...Array(5 - prompts.length).fill("")];

  return (
    <Wrap>
      <p>Prompts</p>
      <PromptContainer>
        {paddedPrompts.map((prompt, index) => (
          <StyledInput
            name={`prompt${index}`}
            key={index}
            label={`${index + 1}`}
            type="text"
            value={prompt}
            onChange={(value) =>
              setPrompts((prev) => {
                const newTags = [...prev];
                newTags[index] = value;
                return newTags;
              })
            }
            /* Not required: a Part 3 takes three to five prompts, so two of
               these five boxes are legitimately empty. Marking them all
               required made the browser demand every one. The real rule is
               checkPartShape, which counts the ones that are filled. */
            minLength={3}
            maxLength={30}
            placeholder={placeholders[index]}
          />
        ))}
      </PromptContainer>
    </Wrap>
  );
};

export default Prompts;
