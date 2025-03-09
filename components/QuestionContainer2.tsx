"use client";

import React, { useState } from "react";
import { getRandomPartOneQuestion } from "../services/part1Service";
import Button from "./ui/Button";
import Instructions from "./Instructions";
import PartOneQuestion from "./PartOneQuestion";
import Timer from "./Timer";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export default function QuestionContainer() {
  const [question, setQuestion] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchNextQuestion() {
    try {
      setLoading(true);
      const newQuestion = await getRandomPartOneQuestion();
      setQuestion(newQuestion);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
      {loading && <LoadingSpinner />}
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
