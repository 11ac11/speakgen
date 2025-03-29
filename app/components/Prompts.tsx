import React from "react";
import styled from "styled-components";
import { Input } from "@/app/components/ui";

const Wrap = styled.div`
  max-width: 500px;
  width: 100%;

  & p {
    margin-bottom: 5px;
    font-size: 1.1rem;
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
    font-size: 14px;
    margin-bottom: 0;
  }
`;

const Prompts = ({
  prompts,
  setPrompts,
}: {
  prompts: string[];
  setPrompts: React.Dispatch<React.SetStateAction<string[]>>; // Correct type for setState
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
            required
            minLength={3}
            maxLength={20}
            placeholder={prompt}
          />
        ))}
      </PromptContainer>
    </Wrap>
  );
};

export default Prompts;
