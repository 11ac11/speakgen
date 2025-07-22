"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Input, Button, Dropdown, Checkbox } from "@/app/components/ui/index";
import Prompts from "./Prompts";
import { createQuestion, updateQuestion } from "@/services/part1Service";
import ThemeSelector from "@/app/components/ThemeSelector";
import ImageSelectors from "./ImageSelectors";
import { getQuestionPartOptions } from "@/constants";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 60px;
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
  levelParam,
}: {
  question?: any; // TODO: change any type
  partParam?: string | undefined;
  levelParam?: string | undefined;
}) => {
  const router = useRouter();
  const isEdit = !!question;

  const [level, setLevel] = useState(levelParam?.toLowerCase() || "");
  const [part, setPart] = useState(partParam || "");
  const [statement, setStatement] = useState(question?.statement || "");
  const [statementTwo, setStatementTwo] = useState(
    question?.statement_two || ""
  );
  const [instructionOne, setInstructionOne] = useState(
    question?.instructions[0]
  );
  const [instructionTwo, setInstructionTwo] = useState(
    question?.instructions[1] || "Now look at all the photos."
  );
  const [prompts, setPrompts] = useState<string[]>(question?.prompts || []);
  const [themes, setThemes] = useState<string[]>(question?.themes || []);
  const [imageIds, setImageIds] = useState(question?.image_ids || []);
  const [loading, setLoading] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);

  const allFieldsCompleted = !!part && !!statement && themes.length > 0;

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
          "getting married",
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
    const requestData = {
      owner_id: "2", // TODO: make dynamic
      statement: statement,
      statement_two: statementTwo,
      themes: themes,
      public: true,
      ...(part === "2" && {
        image_ids: imageIds,
        instructions: [instructionOne, instructionTwo],
      }),
      ...(part === "3" && {
        prompts: prompts,
      }),
    };

    try {
      const res = isEdit
        ? await updateQuestion(level, part, question.id, requestData)
        : await createQuestion(level, part, requestData);
    } catch (error) {
      console.error("Error submitting question:", error);
    } finally {
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
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormRow>
        <Dropdown
          label="Level"
          options={["B2", "C1", "C2"]}
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
      <Button
        onClick={() =>
          handleSubmit(new Event("submit") as unknown as React.FormEvent)
        }
        text={loading ? "Saving..." : isEdit ? "Update" : "Save"}
        isAsync={true}
        disabled={!allFieldsCompleted || loading}
      />
    </StyledForm>
  );
};

export default QuestionForm;
