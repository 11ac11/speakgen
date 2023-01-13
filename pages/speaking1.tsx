import { useState } from 'react';
import Questionbtn from '../components/questionbtn';
import { part1Questions, Part1Questions } from '../data';
import styles from '../styles/speaking3.module.css';

export default function SpeakingOne() {
  const [question, setQuestion] = useState<Part1Questions | undefined>();
  const [questionNum, setQuestionNum] = useState<number>();

  const handleSelectQuestion = () => {
    let i = parseFloat(
      (Math.random() * (part1Questions.length - 1)).toFixed(0)
    );

    if (i !== questionNum) {
      setQuestion(part1Questions[i]);
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
          </div>
        ) : (
          <p>Click for q</p>
        )}
      </>
    </>
  );
}
