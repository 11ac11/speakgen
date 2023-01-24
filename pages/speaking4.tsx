import { useState } from 'react';
import styles from '../styles/speaking4.module.css';
import { Part4Questions, part4Questions } from '../data';
import { Topic } from '../types/topics';
import Questionbtn from '../components/questionbtn';

export default function SpeakingFour() {
  const [question, setQuestion] = useState<Part4Questions | undefined>();
  const [questionNum, setQuestionNum] = useState<number>();

  const handleSelectQuestion = () => {
    let i = parseFloat(
      (Math.random() * (part4Questions.length - 1)).toFixed(0)
    );
    if (i !== questionNum) {
      setQuestion(part4Questions[i]);
      setQuestionNum(i);
      console.log(question);
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
            <div className={`${styles.themeCont} glass`}>
              <p>{question.theme}</p>
              <h2>{question.questions[0]}</h2>
            </div>
          ) : (
            <p>Click for q</p>
          )}
        </>
      </div>
    </>
  );
}
