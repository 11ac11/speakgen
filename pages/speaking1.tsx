import { useEffect, useState } from 'react';
import Questionbtn from '../components/questionbtn';
import { part1 } from '../dataPart1';
import Timer from '../components/timer';
import Instructions from '../components/instructions';
import Secondarybtn from '../components/secondarybtn';

export default function SpeakingOne() {
  const [question, setQuestion] = useState<string | undefined>();
  const [theme, setTheme] = useState<string>();
  const [questionNum, setQuestionNum] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number | undefined>();

  const themes = part1.questionsByTheme;

  useEffect(() => {
    const interval = setInterval(
      () =>
        timeLeft !== undefined
          ? setTimeLeft(timeLeft > 0 ? timeLeft - 1 : 0)
          : '',
      1000
    );

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelectQuestion = () => {
    let i = parseFloat((Math.random() * (themes.length - 1)).toFixed(0));
    let j = parseFloat(
      (Math.random() * (themes[i].questions.length - 1)).toFixed(0)
    );

    if (j !== questionNum) {
      setTheme(themes[i].theme);
      setQuestion(themes[i].questions[j]);
      setQuestionNum(j);
      setTimeLeft(part1.time);
      return;
    }
    handleSelectQuestion();
  };

  return (
    <>
      <div className="container">
        <div className="btn-bar">
          <div className="btns">
            <Questionbtn onClick={handleSelectQuestion} />
            {question ? (
              <Secondarybtn
                onClick={() => {
                  setQuestion(undefined);
                  setTimeLeft(undefined);
                }}
                text="Instructions"
              />
            ) : (
              ''
            )}
          </div>
          <>
            {timeLeft !== 0 ? (
              <Timer time={timeLeft} />
            ) : (
              handleSelectQuestion()
            )}
          </>
        </div>
        <>
          {question ? (
            <div className="themeCont glass">
              <p className="themeText">{theme}</p>
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
