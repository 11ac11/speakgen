"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import styled from "styled-components";
import { Input, Button, Dropdown } from "@/app/components/ui/index";
import Prompts from "./Prompts";
import { createQuestion, updateQuestion } from "@/services/part1Service";
import ThemeSelector from "@/app/components/ThemeSelector";
import ImageSelectors from "./ImageSelectors";

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

  const [level, setLevel] = useState(levelParam || "");
  const [part, setPart] = useState(partParam || "");
  const [statement, setStatement] = useState(question?.statement || "");
  const [statementTwo, setStatementTwo] = useState("");
  const [prompts, setPrompts] = useState<string[]>(question?.prompts || []);
  const [themes, setThemes] = useState<string[]>(question?.themes || []);
  const [loading, setLoading] = useState(false);
  const [imageOneId, setImageOneId] = useState<number>(
    question?.image_one || ""
  );
  const [imageTwoId, setImageTwoId] = useState<number>(
    question?.image_two || ""
  );

  const allFieldsCompleted = !!part && !!statement && themes.length > 0;

  const generatePlaceholderByPart = () => {
    switch (part) {
      case "1":
        return "Tell me about where you live.";
      case "2":
        return "Compare the two ways how people are enjoying listening to music";
      case "3":
        return "What impact is pollution having on the environment?";
      case "4":
        return "Would you prefer to live in a modern city or a city with lots of history?";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!allFieldsCompleted) return;

    setLoading(true);
    const requestData = {
      owner_id: "2", // TODO: make dynamic
      statement: statement,
      themes: themes,
      public: true,
      ...(part === "2" && {
        image_one: imageOneId,
        image_two: imageTwoId,
      }),
      ...(part === "3" && {
        prompts: prompts,
      }),
    };

    try {
      const res = isEdit
        ? await updateQuestion(part, question.id, requestData)
        : await createQuestion(part, requestData);
      console.log("res:", res);
    } catch (error) {
      console.error("Error submitting question:", error);
    } finally {
      setLoading(false);
      router.push("/dashboard");
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormRow>
        <Dropdown
          label="Level"
          options={["B2", "C1"]}
          value={level}
          onChange={setLevel}
          placeholder="-"
          width="100px"
        />
        <Dropdown
          label="Part"
          options={["1", "2", "3", "4"]}
          value={part}
          onChange={setPart}
          placeholder="-"
          width="100px"
        />
      </FormRow>
      {!!level && !!part && (
        <>
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
          {level === "C1" && part === "2" && (
            <Input
              name="statement-2"
              label="Statement 2"
              type="text"
              value={statementTwo}
              onChange={setStatementTwo}
              required
              minLength={1}
              maxLength={200}
              placeholder={generatePlaceholderByPart()}
            />
          )}
          {part === "2" && (
            <ImageSelectors
              imageOneId={imageOneId}
              setImageOneId={setImageOneId}
              imageTwoId={imageTwoId}
              setImageTwoId={setImageTwoId}
            />
          )}
          {part === "3" && (
            <Prompts prompts={prompts} setPrompts={setPrompts} />
          )}
          <ThemeSelector label="Themes" themes={themes} setThemes={setThemes} />
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
