"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Input, Button, Dropdown } from "@/app/components/ui/index";
import Prompts from "./Prompts";
import { createQuestion } from "@/services/part1Service";
import TagSelector from "@/app/components/TagSelector";
import { createClient } from "pexels";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 600px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 300px;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;

  & > * {
    border-radius: 5px;
  }
`;

const SubmitQuestionForm = ({
  question,
  partParam,
  levelParam,
}: {
  question?: any; // TODO: change any type
  partParam?: string | undefined;
  levelParam?: string | undefined;
}) => {
  const [level, setLevel] = useState(levelParam || "");
  const [part, setPart] = useState(partParam || "");
  const [statement, setStatement] = useState(question?.question || "");
  const [statementTwo, setStatementTwo] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(question?.themes || []);
  const [loading, setLoading] = useState(false);
  const [imageOne, setImageOne] = useState<any>(""); // TODO: fix any types
  const [imageTwo, setImageTwo] = useState<any>("");

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

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/pexels?query=beach");
      const data = await res.json();
      setImageOne(data.photos[0]);
      setImageTwo(data.photos[1]);
    };
    fetchImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!allFieldsCompleted) return;

    setLoading(true);
    const requestData = {
      question: statement,
      themes: tags,
      owner_id: "2", // TODO: make dynamic
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
            <ImagesContainer>
              {imageOne ? (
                <>
                  <Image
                    src={imageOne?.src?.landscape}
                    width={200}
                    height={150}
                    alt={imageOne?.alt || ""}
                  />
                  <button onClick={() => setImageOne(null)}>remove</button>
                </>
              ) : (
                <span>upload image 1</span>
              )}
              {imageTwo ? (
                <>
                  <Image
                    src={imageTwo?.src?.landscape}
                    width={200}
                    height={150}
                    alt={imageOne?.alt || ""}
                  />
                  <button onClick={() => setImageTwo(null)}>remove</button>
                </>
              ) : (
                <span>upload image 2</span>
              )}{" "}
            </ImagesContainer>
          )}

          {part === "3" && (
            <Prompts prompts={prompts} setPrompts={setPrompts} />
          )}
          <TagSelector label="Tags" tags={tags} setTags={setTags} />
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
