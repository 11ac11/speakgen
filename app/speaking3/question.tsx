"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/speaking3.module.css";
import { part3 } from "../../dataPart3";
import { Part3QStructure } from "../../types/types";
import Questionbtn from "../../components/questionbtn";
import Instructions from "../../components/instructions";
import Secondarybtn from "../../components/secondarybtn";
import Timer from "../../components/timer";

export default function SpeakingThree() {
  const [question, setQuestion] = useState<Part3QStructure | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number | undefined>();

  const themes = part3.questionsByTheme;

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
      setTimeLeft(part3.time);
      return;
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
        {/* <>
          {timeLeft !== 0 ? <Timer time={timeLeft} /> : handleSelectQuestion()}
        </> */}
      </div>
      <>
        <>
          {question ? (
            <div className={styles.questionCont}>
              <div className={styles.pointsCont}>
                <div className={styles.themePoint}>
                  {question.points
                    .slice(0, question.points.length / 2)
                    .map((question, index) => (
                      <div className={`${styles.question} glass`} key={index}>
                        <p>{question}</p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="themeCont glass">
                <p>{theme}</p>
                <h2>{question.statement}</h2>
              </div>
              <div className={styles.pointsCont}>
                <div className={styles.themePoint}>
                  {question.points
                    .slice(question.points.length / 2)
                    .map((question, index) => (
                      <div className={`${styles.question} glass`} key={index}>
                        <p>{question}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <Instructions
              instructions={part3.instructions}
              speakTo={part3.speakTo}
            />
          )}
        </>
      </>
    </div>
  );
}
