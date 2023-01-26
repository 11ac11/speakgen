import { useState } from 'react';
import { part2 } from '../dataPart2';

import Questionbtn from '../components/questionbtn';
import styles from '../styles/speaking2.module.css';
import Instructions from '../components/instructions';
import { Part2QStructure } from '../types/types';

export default function SpeakingOne() {
  const [question, setQuestion] = useState<Part2QStructure | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();

  const themes = part2.questionsByTheme;

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
      <div className="container">
        <Questionbtn onClick={handleSelectQuestion} />
        <>
          {question ? (
            <>
              <div className="themeCont glass">
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
