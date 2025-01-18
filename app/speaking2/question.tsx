"use client";

import { useEffect, useState } from "react";
import { part2 } from "../../dataPart2";
import Questionbtn from "../../components/questionbtn";
import styles from "../../styles/speaking2.module.css";
import Instructions from "../../components/instructions";
import { Part2QStructure } from "../../types/types";
import Timer from "../../components/timer";
import Secondarybtn from "../../components/secondarybtn";

export default function Question() {
  const [question, setQuestion] = useState<Part2QStructure | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number | undefined>();

  const themes = part2.questionsByTheme;

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
      setTimeLeft(part2.time);
      return;
    }
    handleSelectQuestion();
  };

  return (
    <>
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
          {/* <>
            {timeLeft !== 0 ? (
              <Timer time={timeLeft} />
            ) : (
              handleSelectQuestion()
            )}
          </> */}
        </div>
        <>
          {question ? (
            <>
              <div className="themeCont themeContPart2 glass">
                <h2>{question.statement}</h2>
              </div>
              <div className={styles.imgsCont}>
                <img src={question.image1} alt="text" className={styles.img} />
                <img src={question.image2} alt="text" className={styles.img} />
              </div>
            </>
          ) : (
            <Instructions
              instructions={part2.instructions}
              speakTo={part2.speakTo}
            />
          )}
        </>
      </div>
    </>
  );
}
