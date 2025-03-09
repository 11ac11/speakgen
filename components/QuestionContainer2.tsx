"use client";

import React, { useState } from "react";
import { getRandomPartOneQuestion } from "../services/part1Service";
import Button from "./ui/Button";
import Instructions from "./Instructions";
import PartOneQuestion from "./PartOneQuestion";
import Timer from "./Timer";

export default function QuestionContainer() {
  const [question, setQuestion] = useState<any | null>(null);

  async function fetchNextQuestion() {
    const newQuestion = await getRandomPartOneQuestion();
    setQuestion(newQuestion);
  }

  return (
    <div className="container">
      <div className="btn-bar">
        <div className="btns">
          <Button text="Get Question" onClick={fetchNextQuestion} />
          {question && (
            <Button
              onClick={() => setQuestion(null)}
              text="Instructions"
              secondary
            />
          )}
        </div>
        {question && <Timer question={question} timeLeft={60} />}
      </div>
      {question ? (
        <PartOneQuestion
          question={question.question}
          themes={question.themes}
        />
      ) : (
        <Instructions instructions="test" speakTo="someone" />
      )}
    </div>
  );
}
