"use client";

import { useEffect, useState } from "react";
import styles from "../styles/speaking3.module.css";
import { QuestionTypes, QuestionStructures } from "../types/types";
import Questionbtn from "./questionbtn";
import Instructions from "./instructions";
import Secondarybtn from "./secondarybtn";
import Question2 from "./question2";
import Timer from "./timer";

export default function Question({ questions }: { questions: QuestionTypes }) {
  const { part, instructions, time, speakTo, questionsByTheme } =
    questions || {};

  console.log("questions:", questions);

  const [question, setQuestion] = useState<QuestionStructures | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number | undefined>();

  const themes = questionsByTheme;

  useEffect(() => {
    const interval = setInterval(
      () =>
        timeLeft !== undefined
          ? setTimeLeft(timeLeft > 0 ? timeLeft - 1 : 0)
          : "",
      1000
    );

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelectQuestion = () => {
    let i = parseFloat((Math.random() * (themes.length - 1)).toFixed(0));
    let j = parseFloat(
      (Math.random() * (themes[i].questions.length - 1)).toFixed(0)
    );

    if (j !== questionNum) {
      setTheme(themes[i].theme);
      setQuestion(themes[i].questions[j]);
      setQuestionNum(j);
      setTimeLeft(time);
      return null;
    }
    handleSelectQuestion();
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
                setTimeLeft(undefined);
              }}
              text="Instructions"
            />
          ) : (
            ""
          )}
        </div>
        <>
          {timeLeft !== 0 ? <Timer time={timeLeft} /> : handleSelectQuestion()}
        </>
      </div>
      <>
        <>
          {question ? (
            <Question2 part={part} question={question} theme={theme} />
          ) : (
            <Instructions instructions={instructions} speakTo={speakTo} />
          )}
        </>
      </>
    </div>
  );
}
