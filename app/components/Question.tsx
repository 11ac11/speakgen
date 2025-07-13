"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import styles from "@/styles/speaking3.module.css";
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
  margin-top: 10px;

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
  height: 500px;

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
  if (part === "1" || part === "4") {
    return (
      <div className="themeCont glass">
        <p className="themeText">{theme}</p>
        <h2>{`${question.statement}`}</h2>
      </div>
    );
  }

  if (part === "2") {
    const { image_ids, statement } = question as Part2QStructure;

    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);

    useEffect(() => {
      const fetchImage = async (id: string | null) => {
        if (!id) return null;
        const numId = Number(id);
        if (isNaN(numId)) return null;

        const res = await fetch(`/api/pexels/${numId}`);
        return await res.json();
      };

      const fetchData = async () => {
        try {
          const imageData = await Promise.all(image_ids.map(fetchImage));
          setImages(imageData);
          console.log("imageData:", imageData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      if (image_ids?.length) {
        setLoading(true);
        fetchData();
      }
    }, [image_ids]);

    console.log("images:", images);

    return (
      <>
        <div className="themeCont themeContPart2 glass">
          <Statement>{statement}</Statement>
        </div>
        <ImagesContainer>
          {images?.map((image: any) => {
            return (
              <ImageContainter>
                <Image
                  src={image?.src?.landscape}
                  alt=""
                  style={imageStyle}
                  fill
                />
              </ImageContainter>
            );
          })}
        </ImagesContainer>
      </>
    );
  }

  if (part === "3") {
    const { prompts, statement } = question as Part3QStructure;

    return (
      <>
        <div className={styles.questionCont}>
          <div className={styles.pointsCont}>
            <div className={styles.themePoint}>
              {prompts.slice(0, prompts.length / 2).map((question, index) => (
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
              {prompts.slice(prompts.length / 2).map((question, index) => (
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
