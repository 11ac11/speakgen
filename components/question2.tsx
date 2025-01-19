"use client";

import styles from "../styles/speaking3.module.css";
import { QuestionTypes, QuestionStructures } from "../types/types";

export default function Question({
  question,
  points,
  statement,
  image1,
  image2,
  theme,
  part,
}: {
  question: QuestionStructures | String;
  points?: string[];
  statement?: string;
  image1?: string;
  image2?: string;
  theme: string | undefined;
  part: string | undefined;
}) {
  console.log("question:", question);
  console.log("theme:", theme);
  console.log("part:", part);
  if (part === "part1/4") {
    return (
      <div className="themeCont glass">
        <p className="themeText">{theme}</p>
        <h2>{`${question}`}</h2>
      </div>
    );
  }
  if (part === "part2") {
    return (
      <>
        <div className="themeCont themeContPart2 glass">
          <h2>{statement}</h2>
        </div>
        <div className={styles.imgsCont}>
          <img src={image1} alt="text" className={styles.img} />
          <img src={image2} alt="text" className={styles.img} />
        </div>
      </>
    );
  }
  if (part === "part3" && points?.length) {
    return (
      <>
        <div className={styles.questionCont}>
          <div className={styles.pointsCont}>
            <div className={styles.themePoint}>
              {points.slice(0, points.length / 2).map((question, index) => (
                <div className={`${styles.question} glass`} key={index}>
                  <p>{question}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="themeCont glass">
            <p>{theme}</p>
            <h2>{statement}</h2>
          </div>
          <div className={styles.pointsCont}>
            <div className={styles.themePoint}>
              {points.slice(points.length / 2).map((question, index) => (
                <div className={`${styles.question} glass`} key={index}>
                  <p>{question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
