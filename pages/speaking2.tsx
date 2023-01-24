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
            <>
              <h3>Instructions:</h3>
              <p>
                The examiner will ask you/your partner to compare two
                photographs relating to a question. They will then ask a short
                question related to the photographs to the other person. Then
                they will change photographs for the next person.
              </p>
              <h3>Speak to:</h3>
              <p>The examiner</p>
            </>
          )}
        </>
      </div>
    </>
  );
}
