import { useState } from 'react';
import Image from 'next/image';

import Questionbtn from '../components/questionbtn';
import { part2Questions, Part2Questions } from '../data';
import styles from '../styles/speaking3.module.css';

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
      <Questionbtn onClick={handleSelectQuestion} />
      <>
        {question ? (
          <div className={`${styles.container}`}>
            <div className={`${styles.themeCont} glass`}>
              <h2>{question.question}</h2>
            </div>
            <div className={styles.imgsCont}>
              <div className={styles.imgCont}>
                <img src={question.image1}></img>
              </div>
              <div className={styles.imgCont}>
                <Image
                  src="/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=803&q=80"
                  alt="text"
                  width={500}
                  height={500}
                />
              </div>
            </div>
          </div>
        ) : (
          <p>Click for q</p>
        )}
      </>
    </>
  );
}
