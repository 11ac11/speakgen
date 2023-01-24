import { useState } from 'react';
import Image from 'next/image';

import Questionbtn from '../components/questionbtn';
import { part2Questions, Part2Questions } from '../data';
import styles from '../styles/speaking2.module.css';

export default function SpeakingOne() {
  const [question, setQuestion] = useState<Part2Questions | undefined>();
  const [questionNum, setQuestionNum] = useState<number>();

  const handleSelectQuestion = () => {
    let i = parseFloat(
      (Math.random() * (part2Questions.length - 1)).toFixed(0)
    );

    if (i !== questionNum) {
      setQuestion(part2Questions[i]);
      setQuestionNum(i);
      console.log(i);
      return;
    }
    handleSelectQuestion();
    console.log(question);
  };

  return (
    <>
      <div className={`${styles.container}`}>
        <Questionbtn onClick={handleSelectQuestion} />
        <>
          {question ? (
            <>
              <div className={`${styles.themeCont} glass`}>
                <h2>{question.question}</h2>
              </div>
              <div className={styles.imgsCont}>
                <img src={question.image1} alt="text" className={styles.img} />
                <img src={question.image2} alt="text" className={styles.img} />
              </div>
            </>
          ) : (
            <p>Click for q</p>
          )}
        </>
      </div>
    </>
  );
}
