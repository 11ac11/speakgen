import { useState } from 'react';
import styles from '../styles/speaking4.module.css';
import { Part4Questions, part4Questions } from '../data';
import { Topic } from '../types/topics';
import Questionbtn from '../components/questionbtn';
import Timer from '../components/timer';

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
        <div className={styles.topBar}>
          <Questionbtn onClick={handleSelectQuestion} />
          {question ? (
            <Questionbtn
              onClick={() => setQuestion(undefined)}
              text="Instructions"
            />
          ) : (
            ''
          )}
          <Timer time={60} />
        </div>
        <>
          {question ? (
            <div className={`${styles.themeCont} glass`}>
              <p>{question.theme}</p>
              <h2>{question.questions[0]}</h2>
            </div>
          ) : (
            <div className={styles.instructionBox}>
              <h3>Instructions:</h3>
              <p>
                The examiner will ask you questions related to the topic from
                part 3. You should answer the questions, but also ask your
                partners opinions and ideas. It should be a conversation between
                3 people.
              </p>
              <h3>Speak to:</h3>
              <p>The examiner and your partner</p>
            </div>
          )}
        </>
      </div>
    </>
  );
}
