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

/* Five boxes, of which a Part 3 fills three to five. The blueprint holds the
   real per-task range; this is just how many the editor draws. */
const SLOTS = 5;

const Prompts = ({
  prompts,
  setPrompts,
  placeholders
}: {
  prompts: string[];
  setPrompts: React.Dispatch<React.SetStateAction<string[]>>; // Correct type for setState
  placeholders: string[];
}) => {
  /* Dense, not spread-and-pad.
     
     Assigning by index into a copy of the real array leaves holes: type into
     the fourth box of an empty form and you store [ , , , "x"], which spreads
     to [null, null, null, "x", ""]. React sees value={null} on the three boxes
     above and reports a controlled input turning uncontrolled — after which
     those boxes keep their own DOM value and stop agreeing with state.
     
     Reading every slot through ?? "" means there is never a hole to render, and
     writing through the padded array means there is never one to store. */
  const paddedPrompts = Array.from(
    { length: SLOTS },
    (_, index) => prompts[index] ?? ""
  );

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
                const next = Array.from(
                  { length: SLOTS },
                  (_, i) => prev[i] ?? ""
                );
                next[index] = value;
                return next;
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
