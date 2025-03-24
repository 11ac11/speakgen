"use client";

import React, { CSSProperties } from "react";
import Image from "next/image";
import styles from "../styles/speaking3.module.css";
import styled from "styled-components";
import {
  QuestionStructures,
  Part2QStructure,
  Part3QStructure,
} from "@/types/types";

const ImagesContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  height: 60%;
  max-height: 60%;
  position: relative;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    img {
      width: 100%;
    }
  }
`;

const ImageContainter = styled.div`
  position: relative;
  width: 50%;

  @media only screen and (max-width: 768px) {
    width: 100%;
    height: 60%;
  }
`;

const Statement = styled.span`
  font-size: 2rem;
  margin: 0.5rem 1rem;

  @media only screen and (max-width: 768px) {
    font-size: 1rem;
  }
`;

const imageStyle: CSSProperties = {
  borderRadius: "1rem",
  objectFit: "cover", // Valid objectFit value
};

export default function Question({
  question,
  theme,
  part,
}: {
  question: QuestionStructures | String;
  theme: string | undefined;
  part: string | undefined;
}) {
  if (part === "part1/4") {
    return (
      <div className="themeCont glass">
        <p className="themeText">{theme}</p>
        <h2>{`${question}`}</h2>
      </div>
    );
  }

  if (part === "part2") {
    const { image1, image2, statement } = question as Part2QStructure;

    return (
      <>
        <div className="themeCont themeContPart2 glass">
          <Statement>{statement}</Statement>
        </div>
        <ImagesContainer>
          <ImageContainter>
            <Image src={image1} alt="" style={imageStyle} fill />
          </ImageContainter>
          <ImageContainter>
            <Image src={image2} alt="" style={imageStyle} fill />
          </ImageContainter>
        </ImagesContainer>
      </>
    );
  }

  if (part === "part3") {
    const { points, statement } = question as Part3QStructure;

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
