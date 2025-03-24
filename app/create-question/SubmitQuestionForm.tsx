"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button, Dropdown } from "@/app/components/ui/index";
import Prompts from "./Prompts";
import { createQuestion } from "@/services/part1Service";
import Question from "@/app/components/Question";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 500px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 250px;
`;

const SubmitQuestionForm = () => {
  const [level, setLevel] = useState("");
  const [part, setPart] = useState("");
  const [statement, setStatement] = useState("");
  const [statementTwo, setStatementTwo] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const allFieldsCompleted = !!part && !!statement && tags.length > 0;

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
      question: statement,
      themes: tags,
      owner_id: null,
      public: true,
      part,
    };

    try {
      const res = await createQuestion(part, requestData);
      console.log("res:", res);
      setStatement("");
      setTags([]);
    } catch (error) {
      console.error("Error submitting question:", error);
    } finally {
      setLoading(false);
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
        />
        <Dropdown
          label="Part"
          options={["1", "2", "3", "4"]}
          value={part}
          onChange={setPart}
          placeholder="-"
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
            maxLength={200} // Increased for better usability
            placeholder={generatePlaceholderByPart()}
          />
          {level === "C1" && (
            <Input
              name="statement-2"
              label="Statement 2"
              type="text"
              value={statementTwo}
              onChange={setStatementTwo}
              required
              minLength={1}
              maxLength={200} // Increased for better usability
              placeholder={generatePlaceholderByPart()}
            />
          )}
          {part === "2" && (
            <>
              <span>upload image 1</span>
              <span>upload image 2</span>
            </>
          )}

          {part === "3" && (
            <Prompts prompts={prompts} setPrompts={setPrompts} />
          )}
          <Input
            name="tags"
            label="Tags"
            type="text"
            value={tags.join(",")}
            onChange={(string: string) =>
              setTags(string.split(",").map((s) => s.trim()))
            }
            required
            placeholder={"Environment, Travel, Technology"}
          />
        </>
      )}
      <Button
        onClick={() =>
          handleSubmit(new Event("submit") as unknown as React.FormEvent)
        }
        text={loading ? "Submitting..." : "Create Question"}
        isAsync={true}
        disabled={!allFieldsCompleted || loading}
      />
    </StyledForm>
  );
};

export default SubmitQuestionForm;
