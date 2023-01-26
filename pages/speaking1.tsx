import { useState } from 'react';
import Questionbtn from '../components/questionbtn';
import { Part2QStructure, Part3QStructure } from '../types/types';
import { part1 } from '../dataPart1';
import styles from '../styles/speaking3.module.css';
import Timer from '../components/timer';

export default function SpeakingOne() {
  const [question, setQuestion] = useState<
    string | Part2QStructure | Part3QStructure
  >();
  const [questionNum, setQuestionNum] = useState<number>();

  const questionsPart1 = part1.questionsByTheme
    .map((val) => val.questions)
    .flat();

  const handleSelectQuestion = () => {
    console.log(questionsPart1);
    let i = parseFloat(
      (Math.random() * (questionsPart1.length - 1)).toFixed(0)
    );

    if (i !== questionNum) {
      setQuestion(questionsPart1[i]);
      setQuestionNum(i);
      return;
    }
    handleSelectQuestion();
  };

  return (
    <>
      <div className={`${styles.container}`}>
        <Questionbtn onClick={handleSelectQuestion} />
        <Timer time={part1.time} />
        <>
          {question && typeof question === 'string' ? (
            <div className={`${styles.themeCont} glass`}>
              <h2>{question}</h2>
            </div>
          ) : (
            <>
              <h3>Instructions:</h3>
              <p>{part1.instructions}</p>
              <h3>Speak to:</h3>
              <p>{part1.speakTo}</p>
            </>
          )}
        </>
      </div>
    </>
  );
}
