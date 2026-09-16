"use client";

import React, { useState } from "react";
import { getRandomQuestion } from "@/services/questionService";
import Button from "./ui/Button";
import Timer from "./Timer";
import { LoadingSpinner } from "./ui/LoadingSpinner";

// Not currently rendered anywhere; kept because its markup is half written.
// The level and part used to be implicit in a service function that requested
// a route with no level in it and so never returned a question.
export default function QuestionContainer({
  level = "b2",
  part = "1"
}: {
  level?: string;
  part?: string;
}) {
  const [question, setQuestion] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchNextQuestion() {
    try {
      setLoading(true);
      const newQuestion = await getRandomQuestion(level, part);
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
      {/* {question ? (
        <PartOneQuestion
          question={question.question}
          themes={question.themes}
        />
      ) : (
        <Instructions instructions="test" speakTo="someone" />
      )} */}
    </div>
  );
}
