"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Input, Button, Dropdown, Checkbox } from "@/app/components/ui/index";
import Prompts from "./Prompts";
import { createQuestion, updateQuestion } from "@/services/questionService";
import ThemeSelector from "@/app/components/ThemeSelector";
import ImageSelectors from "./ImageSelectors";
import { getQuestionPartOptions, SUPPORTED_LEVELS } from "@/constants";
import {
  checkPartShape,
  filledImageIds,
  filledPrompts
} from "@/lib/questionRules";
import type { QuestionRow } from "@/lib/questions";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 60px;
`;

const Hint = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

const FormError = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  color: var(--danger);
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 300px;
`;

const QuestionForm = ({
  question,
  partParam,
  levelParam
}: {
  /* Exactly what the edit page hands over: the row getQuestionById returns.
     There is no separate form shape to keep in step with it. */
  question?: QuestionRow;
  partParam?: string | undefined;
  levelParam?: string | undefined;
}) => {
  const router = useRouter();
  const isEdit = !!question;

  const [level, setLevel] = useState(levelParam?.toLowerCase() || "");
  const [part, setPart] = useState(partParam || "");
  const [statement, setStatement] = useState(question?.statement || "");
  const [statementTwo, setStatementTwo] = useState(
    question?.statement_two ?? ""
  );
  /* Optional index, not question?.instructions[0]: a question created before
     instructions existed has an empty array, and the old form of this threw. */
  const [instructionOne, setInstructionOne] = useState(
    question?.instructions?.[0] ?? ""
  );
  const [instructionTwo, setInstructionTwo] = useState(
    question?.instructions?.[1] || "Now look at all the photos."
  );
  const [prompts, setPrompts] = useState<string[]>(question?.prompts ?? []);
  const [themes, setThemes] = useState<string[]>(question?.themes ?? []);
  const [imageIds, setImageIds] = useState<(number | null)[]>(
    question?.image_ids ?? []
  );
  const [isPublic, setIsPublic] = useState(question?.public ?? true);
  const [loading, setLoading] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* Part 2 needs its photographs and Part 3 its prompts — the same rule the
     database enforces. Without this the form let you save a Part 3 with one
     prompt, the insert broke a CHECK constraint, and the question was lost. */
  const partShapeError = (() => {
    let message: string | null = null;
    checkPartShape(part, { image_ids: imageIds, prompts }, (_path, text) => {
      message = message ?? text;
    });
    return message as string | null;
  })();

  // Level is required too. /questions/new starts with none chosen, and
  // submitting without one used to build a request with an empty level.
  const allFieldsCompleted =
    !!level && !!part && !!statement && themes.length > 0 && !partShapeError;

  const generatePlaceholderByPart = (isSecondStatement?: boolean) => {
    switch (part) {
      case "1":
        return "Tell me about where you live.";
      case "2":
        if (!isSecondStatement) {
          return "Compare the two ways how people are enjoying listening to music";
        } else {
          return `I'd like you to imagine that a television documentary is being produced on
working in the food industry. These pictures show some of the issues that are
being considered. \n \n
Talk together about the different issues related to working in the food industry
that these pictures show. Then decide which issue might stimulate most
interest.`;
        }
      case "3":
        if (!isSecondStatement) {
          return "What might people have to consider when making decisions?";
        } else {
          return "Decide in which situation it is important to make the right decision.";
        }
      case "4":
        return "Would you prefer to live in a modern city or a city with lots of history?";
      default:
        return "";
    }
  };

  const generatePromptPlaceholdersByLevel = () => {
    switch (level.toLowerCase()) {
      case "b2":
        return [];
      case "c1":
        return [
          "choosing a university",
          "starting a family",
          "moving to another country",
          "finding a job",
          "getting married"
        ];
      case "c2":
        return [];
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!allFieldsCompleted) return;

    setLoading(true);
    setFormError(null);
    const requestData = {
      statement: statement,
      statement_two: statementTwo,
      themes: themes,
      public: isPublic,
      ...(part === "2" && {
        image_ids: filledImageIds(imageIds),
        instructions: [instructionOne, instructionTwo]
      }),
      ...(part === "3" && {
        prompts: filledPrompts(prompts)
      })
    };

    /* The redirect used to live in a finally block, so it ran whether the save
       succeeded or threw. A failed save looked exactly like a successful one,
       and the question was gone. Leaving is part of succeeding now. */
    try {
      if (isEdit) {
        await updateQuestion(question.id, requestData);
      } else {
        await createQuestion(level, part, requestData);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save the question"
      );
      setLoading(false);
      return;
    }

    setLoading(false);

    if (createAnother) {
      setStatement("");
      setStatementTwo("");
      setInstructionOne("");
      setInstructionTwo("");
      setPrompts([]);
      setThemes([]);
      setImageIds([]);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormRow>
        <Dropdown
          label="Level"
          options={SUPPORTED_LEVELS}
          value={level.toUpperCase()}
          onChange={(val) => setLevel(val.toLowerCase())}
          placeholder="-"
          width="100px"
        />
        <Dropdown
          label="Part"
          options={getQuestionPartOptions(level)}
          value={part}
          onChange={setPart}
          placeholder="-"
          width="100px"
        />
      </FormRow>
      {!!level && !!part && (
        <>
          {level === "c2" && part === "2" && (
            <Input
              name="instructionOne"
              label="First Instruction"
              type="text"
              value={instructionOne}
              onChange={setInstructionOne}
              required
              minLength={1}
              maxLength={200}
              placeholder={"Look at photo one"}
            />
          )}
          <Input
            name="statement"
            label="Statement"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={1}
            maxLength={200}
            placeholder={generatePlaceholderByPart()}
          />
          {level === "c2" && part === "2" && (
            <Input
              name="instructionTwo"
              label="Second Instruction"
              type="text"
              value={instructionTwo}
              onChange={setInstructionTwo}
              required
              minLength={1}
              maxLength={200}
              placeholder={"Now look at all the photos."}
              disabled={true}
            />
          )}
          {(level === "c1" || level === "c2") &&
            (part === "2" || part === "3") && (
              <Input
                name="statement-2"
                label="Statement 2"
                type="text"
                value={statementTwo}
                onChange={setStatementTwo}
                required
                minLength={1}
                maxLength={500}
                placeholder={generatePlaceholderByPart(true)}
                isTextArea={true}
              />
            )}
          {part === "2" && (
            <ImageSelectors
              imageIds={imageIds}
              setImageIds={setImageIds}
              level={level}
            />
          )}
          {part === "3" && (
            <Prompts
              prompts={prompts}
              setPrompts={setPrompts}
              placeholders={generatePromptPlaceholdersByLevel()}
            />
          )}
          <ThemeSelector label="Themes" themes={themes} setThemes={setThemes} />
          <Checkbox
            checked={isPublic}
            onChange={setIsPublic}
            label="Public question"
          />
          {!isEdit && (
            <>
              <Checkbox
                checked={createAnother}
                onChange={() => setCreateAnother(!createAnother)}
                label={"Create another"}
              />
            </>
          )}
        </>
      )}
      {/* A disabled Save with no explanation is worse than the error it is
          preventing, so the rule that is holding it back is named. */}
      {partShapeError ? <Hint>{partShapeError}</Hint> : null}
      {formError ? <FormError role="alert">{formError}</FormError> : null}
      {/* Submitting is the form's job, not the button's. This used to call
          handleSubmit from onClick while also being a submit button by
          default, so a click ran it twice — two POSTs and two questions. When
          a required field was empty the browser blocked the native submit and
          the onClick fired anyway, saving a row that skipped validation. The
          sign-in and sign-up forms already did it this way. */}
      <Button
        onClick={() => undefined}
        type="submit"
        text={loading ? "Saving..." : isEdit ? "Update" : "Save"}
        isAsync={false}
        disabled={!allFieldsCompleted || loading}
      />
    </StyledForm>
  );
};

export default QuestionForm;
