"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button, Dropdown } from "../../components/ui/index";
import Prompts from "./Prompts";
import { createQuestion } from "../../services/part1Service";
import Question from "../../components/Question";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 500px;
`;

const SubmitQuestionForm = () => {
  const [level, setLevel] = useState("B2");
  const [part, setPart] = useState("1");
  const [statement, setStatement] = useState("");
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
      <Dropdown
        label="Part"
        options={["1", "2", "3", "4"]}
        value={part}
        onChange={setPart}
        placeholder="1"
      />
      <Input
        label="Statement"
        type="text"
        value={statement}
        onChange={setStatement}
        required
        minLength={1}
        maxLength={200} // Increased for better usability
        placeholder={generatePlaceholderByPart()}
      />
      {part === "2" && (
        <>
          <span>upload image 1</span>
          <span>upload image 2</span>
        </>
      )}

      {part === "3" && <Prompts prompts={prompts} setPrompts={setPrompts} />}
      <Input
        label="Tags"
        type="text"
        value={tags.join(",")}
        onChange={(string: string) =>
          setTags(string.split(",").map((s) => s.trim()))
        }
        required
        placeholder={"Environment, Travel, Technology"}
      />
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
