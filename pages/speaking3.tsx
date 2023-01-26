import { useState } from 'react';
import styles from '../styles/speaking3.module.css';
import { topics } from '../data';
import { Topic } from '../types/types';
import Questionbtn from '../components/questionbtn';

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
        {question ? (
          <>
            <Questionbtn onClick={handleSelectQuestion} />
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
                <h2>{question.topic}</h2>
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
          </>
        ) : (
          <>
            <div className={styles.messageCont}>
              <Questionbtn onClick={handleSelectQuestion} />
              <>
                <h3>Instructions:</h3>
                <p>
                  The examiner will ask you to have a conversation with your
                  partner and discuss an idea with some prompts to help you.
                  After around 2 minutes, the examiner will ask you to try and
                  decide the most suitable prompt in your opinion.
                </p>
                <h3>Speak to:</h3>
                <p>Your partner</p>
              </>
            </div>
          </>
        )}
      </div>
    </>
  );
}
