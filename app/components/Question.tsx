"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import styled from "styled-components";
import { StatementAndTheme } from "./ui/StatementAndTheme";
import {
  QuestionStructures,
  Part2QStructure,
  Part3QStructure,
  NewPart1QStructure,
} from "@/types/types";
import { LoadingSpinner } from "./ui/LoadingSpinner";

const ImagesContainer = styled.div`
  width: 100%;
  max-width: 90%;
  display: flex;
  gap: 1rem;
  height: 60%;
  max-height: 60%;
  position: relative;
  margin-top: 20px;

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

const ImageContainer = styled.div`
  position: relative;
  width: 50%;
  height: 50vh;

  @media only screen and (max-width: 768px) {
    width: 100%;
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
  part,
}: {
  question: QuestionStructures;
  part: string;
}) {
  if (!question) return;

  switch (part) {
    case "1":
    case "4":
      return <Part1or4 question={question as NewPart1QStructure} />;
    case "2":
      return <Part2 question={question as Part2QStructure} />;
    case "3":
      return <Part3 question={question as Part3QStructure} />;
    default:
      return <>'Not a valid part'</>;
  }
}

const Part1or4 = ({ question }: { question: NewPart1QStructure }) => {
  return (
    <StatementAndTheme
      statement={question.statement}
      themes={question?.themes}
    />
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
      <StatementAndTheme statement={statement} themes={question?.themes} />
      <ImagesContainer>
        {!loading && images?.length ? (
          images.map((image, index) => (
            <ImageContainer key={index}>
              <Image
                src={image?.src?.landscape}
                alt=""
                style={{ objectFit: "cover" }}
                fill
              />
            </ImageContainer>
          ))
        ) : (
          <LoadingSpinner />
        )}
      </ImagesContainer>
    </>
  );
};

const Part3 = ({ question }: { question: Part3QStructure }) => {
  const { prompts, statement } = question;
  const mid = Math.ceil(prompts.length / 2);

  return (
    <Container>
      <QuestionCont>
        <PromptContainer>
          {prompts.slice(0, mid).map((prompt, i) => (
            <Prompt className={`glass`} key={i}>
              <p>{prompt}</p>
            </Prompt>
          ))}
        </PromptContainer>
        <StatementAndTheme statement={statement} themes={question?.themes} />
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
