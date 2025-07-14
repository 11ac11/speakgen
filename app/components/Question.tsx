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

  img {
    border-radius: 8px;
  }

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
  font-weight: 700;

  @media only screen and (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Container = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  width: 100%;
  gap: 2%;
`;

const QuestionCont = styled.div`
  height: fit-content;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const StatementContainer = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  justify-content: center;
  border-radius: 1rem;
  padding: 1rem;
  flex-direction: column;
  height: 30%;
  width: 70%;
  text-align: center;

  @media only screen and (max-width: 768px) {
    min-height: 30%;
  }
`;

const PromptContainer = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Prompt = styled.div`
  flex: 1;
  height: auto;
  min-height: 20%;
  min-width: min-content;
  border-radius: 1rem;
  text-align: center;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;

  @media only screen and (max-width: 768px) {
    padding: 0.5rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: lowercase;

    @media only screen and (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

export default function Question({
  question,
  theme,
  part,
}: {
  question: QuestionStructures;
  theme: string | undefined;
  part: string | undefined;
}) {
  if (!question) return;
  switch (part) {
    case "1":
    case "4":
      return <Part1or4 theme={theme} statement={question?.statement} />;
    case "2":
      return <Part2 question={question as Part2QStructure} />;
    case "3":
      return <Part3 theme={theme} question={question as Part3QStructure} />;
    default:
      return null;
  }
}

const Part1or4 = ({
  theme,
  statement,
}: {
  theme: string | undefined;
  statement: string | undefined;
}) => {
  return (
    <div className="themeCont glass">
      <p className="themeText">{theme}</p>
      <Statement>{statement}</Statement>
    </div>
  );
};

const Part2 = ({ question }: { question: Part2QStructure }) => {
  const { image_ids, statement } = question;

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchImage = async (id: string | number | null) => {
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

  return (
    <>
      <div className="themeCont themeContPart2 glass">
        <Statement>{statement}</Statement>
      </div>
      <ImagesContainer>
        {images.map((image, index) => (
          <ImageContainter key={index}>
            <Image
              src={image?.src?.landscape}
              alt=""
              style={{ objectFit: "cover" }}
              fill
            />
          </ImageContainter>
        ))}
      </ImagesContainer>
    </>
  );
};

const Part3 = ({
  theme,
  question,
}: {
  theme: string | undefined;
  question: Part3QStructure;
}) => {
  const { prompts, statement } = question;
  const mid = Math.ceil(prompts.length / 2);

  return (
    <Container>
      <QuestionCont className={styles.questionCont}>
        <PromptContainer>
          {prompts.slice(0, mid).map((prompt, i) => (
            <Prompt className={`glass`} key={i}>
              <p>{prompt}</p>
            </Prompt>
          ))}
        </PromptContainer>
        <StatementContainer className="glass">
          <p>{theme}</p>
          <Statement>{statement}</Statement>
        </StatementContainer>
        <PromptContainer>
          {prompts.slice(mid).map((prompt, i) => (
            <Prompt className={`glass`} key={i}>
              <p>{prompt}</p>
            </Prompt>
          ))}
        </PromptContainer>
      </QuestionCont>
    </Container>
  );
};
