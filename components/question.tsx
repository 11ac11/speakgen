"use client";

import { useEffect, useState } from "react";
import styles from "../styles/speaking3.module.css";
import {
  QuestionTypes,
  QuestionStructures,
  Part2QStructure,
  Part3QStructure,
} from "../types/types";
import Questionbtn from "./questionbtn";
import Instructions from "./instructions";
import Secondarybtn from "./secondarybtn";
import Question2 from "./question2";
import Timer from "./timer";

export default function Question({ questions }: { questions: QuestionTypes }) {
  const { part, instructions, time, speakTo, questionsByTheme } =
    questions || {};

  const [question, setQuestion] = useState<QuestionStructures | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();

  const themes = questionsByTheme;

  console.log("question:", question);

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
          <Questionbtn onClick={handleSelectQuestion} />
          {question ? (
            <Secondarybtn
              onClick={() => {
                setQuestion(undefined);
              }}
              text="Instructions"
            />
          ) : (
            ""
          )}
        </div>
        <>{!!question && <Timer question={question} timeLeft={time} />}</>
      </div>
      <>
        {question ? (
          <Question2
            part={part}
            question={question}
            theme={theme}
            points={(question as Part3QStructure).points}
            statement={
              (question as Part2QStructure | Part3QStructure).statement
            }
          />
        ) : (
          <Instructions instructions={instructions} speakTo={speakTo} />
        )}
      </>
    </div>
  );
}
