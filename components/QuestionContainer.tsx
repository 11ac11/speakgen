"use client";

import React from "react";
import { useState } from "react";
import { QuestionTypes, QuestionStructures } from "../types/types";
import Button from "../components/ui/Button";
import Instructions from "./Instructions";
import Question from "./Question";
import Timer from "./Timer";

export default function QuestionContainer({
  questions,
}: {
  questions: QuestionTypes;
}) {
  const { part, instructions, time, speakTo, questionsByTheme } =
    questions || {};

  const [question, setQuestion] = useState<QuestionStructures | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();

  const themes = questionsByTheme;

  const handleSelectQuestion = () => {
    let i = parseFloat((Math.random() * (themes.length - 1)).toFixed(0));
    let j = parseFloat(
      (Math.random() * (themes[i].questions.length - 1)).toFixed(0)
    );

    if (j !== questionNum) {
      setTheme(themes[i].theme);
      setQuestion(themes[i].questions[j]);
      setQuestionNum(j);
    } else {
      handleSelectQuestion();
    }
  };

  return (
    <div className="container">
      <div className="btn-bar">
        <div className="btns">
          <Button
            text="Get Question"
            onClick={handleSelectQuestion}
            isAsync={false}
          />
          {question ? (
            <Button
              onClick={() => {
                setQuestion(undefined);
              }}
              text="Instructions"
              secondary
            />
          ) : (
            ""
          )}
        </div>
        <>{!!question && <Timer question={question} timeLeft={time} />}</>
      </div>
      <>
        {question ? (
          <Question part={part} question={question} theme={theme} />
        ) : (
          <Instructions instructions={instructions} speakTo={speakTo} />
        )}
      </>
    </div>
  );
}
