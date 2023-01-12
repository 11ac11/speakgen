import { useState } from 'react';
import styles from '../styles/speaking3.module.css';
import { topics } from '../data';
import { Topic } from '../types/topics';
import Nav from '../components/nav';

export default function SpeakingThree() {
  const [question, setQuestion] = useState<Topic | undefined>();
  const [questionNum, setQuestionNum] = useState<number>();

  const handleSelectQuestion = () => {
    let i = parseFloat((Math.random() * (topics.length - 1)).toFixed(0));

    if (i !== questionNum) {
      setQuestion(topics[i]);
      setQuestionNum(i);
      console.log(i);
      return;
    }
    handleSelectQuestion();
  };

  return (
    <>
      <div className={styles.container}>
        <button onClick={handleSelectQuestion}>Get Question</button>

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
            <div className={`${styles.themeCont} glass`}>
              <div>
                <h2>{question.topic}</h2>
              </div>
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
          <div className={styles.messageCont}>
            <p>Click the button to get a question</p>
          </div>
        )}
      </div>
    </>
  );
}
