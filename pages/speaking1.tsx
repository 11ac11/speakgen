import { useState } from 'react';
import Questionbtn from '../components/questionbtn';
import { Part2QStructure, Part3QStructure } from '../types/types';
import { part1 } from '../dataPart1';
import styles from '../styles/speaking1.module.css';
import Timer from '../components/timer';
import Instructions from '../components/instructions';

export default function SpeakingOne() {
  const [question, setQuestion] = useState<
    string | Part2QStructure | Part3QStructure
  >();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();

  const themes = part1.questionsByTheme;

  const handleSelectQuestion = () => {
    let i = parseFloat((Math.random() * (themes.length - 1)).toFixed(0));
    let j = parseFloat(
      (Math.random() * (themes[i].questions.length - 1)).toFixed(0)
    );

    if (j !== questionNum) {
      setTheme(themes[i].theme);
      setQuestion(themes[i].questions[j]);
      setQuestionNum(j);
      console.log(theme, question);
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
              <p className={styles.themeText}>{theme}</p>
              <h2>{question}</h2>
            </div>
          ) : (
            <Instructions
              instructions={part1.instructions}
              speakTo={part1.speakTo}
            />
          )}
        </>
      </div>
    </>
  );
}
