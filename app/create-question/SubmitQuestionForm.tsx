"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Input, Button, Dropdown } from "../../components/ui/index";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SubmitQuestionForm = () => {
  const [level, setLevel] = useState("B2");
  const [part, setPart] = useState("1");
  const [statement, setStatement] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [tags, setTags] = useState<string[]>([]);

  const allFieldsCompleted = !!part && !!statement && !!tags;

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
        "";
    }
  };

  return (
    <StyledForm>
      {/* <Dropdown
        label="Level"
        type="text"
        value={level}
        onChange={setLevel}
        required
        minLength={3}
        maxLength={20}
        placeholder="B2"
      /> */}
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
        maxLength={1}
        placeholder={generatePlaceholderByPart()}
      />
      {part === "2" && (
        <>
          <span>upload image 1</span>
          <span>upload image 2</span>
        </>
      )}
      {part === "3" && (
        <>
          <Input
            label="Prompt 1"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={3}
            maxLength={20}
            placeholder={"Air"}
          />
          <Input
            label="Prompt 2"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={3}
            maxLength={20}
            placeholder={"Water"}
          />
          <Input
            label="Prompt 3"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={3}
            maxLength={20}
            placeholder={"Land"}
          />
          <Input
            label="Prompt 4"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={3}
            maxLength={20}
            placeholder={"Wildlife"}
          />
          <Input
            label="Prompt 5"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={3}
            maxLength={20}
            placeholder={"Climate"}
          />
        </>
      )}
      <Input
        label="Tags"
        type="text"
        value={tags.join(",")}
        onChange={(string: string) =>
          setTags(string.split(",").map((string) => string))
        }
        required
        minLength={3}
        maxLength={20}
        placeholder={"Environment"}
      />
      <Button
        onClick={() => console.log("button click")}
        text={"Create Question"}
        isAsync={false}
        disabled={!allFieldsCompleted}
      />
    </StyledForm>
  );
};

export default SubmitQuestionForm;
