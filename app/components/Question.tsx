"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import styled from "styled-components";
import { StatementAndTheme } from "./ui/StatementAndTheme";
import {
  QuestionStructures,
  Part2QStructure,
  Part3QStructure,
  NewPart1QStructure
} from "@/types/types";
import { LoadingSpinner } from "./ui/LoadingSpinner";

const ImagesContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  position: relative;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;

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
  width: 45%;
  height: 40vh;

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
  gap: 50px;
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
  min-height: 10vh;
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
    font-size: var(--text-lg);
    font-weight: 500;
    text-transform: lowercase;

    @media only screen and (max-width: 768px) {
      font-size: var(--text-base);
    }
  }
`;

/**
 * The question on screen, for whichever phase of the part is showing.
 *
 * `statement` and `instruction` are the phase's, not the question's: a part runs
 * in one, two or three phases, and the words change between them while the
 * photographs or prompts stay put. Defaulting to question.statement keeps the
 * single-phase parts — and any caller that has no phases to give — working
 * exactly as before.
 */
export default function Question({
  question,
  part,
  statement,
  instruction,
  afterStatement
}: {
  question: QuestionStructures;
  part: string;
  statement?: string;
  instruction?: string | null;
  /**
   * Rendered directly beneath the statement card, which is where the phase
   * controls go.
   *
   * A slot rather than something the caller puts after <Question>, because
   * after is below two 40vh photographs: on a projector the button that moves
   * the exam on was off the bottom of the screen. It belongs with the words it
   * advances, above the material they are about.
   */
  afterStatement?: React.ReactNode;
}) {
  if (!question) return <>No question</>;

  const shown = statement ?? question.statement;

  switch (part) {
    case "1":
    case "4":
      return (
        <Part1or4
          question={question as NewPart1QStructure}
          statement={shown}
          instruction={instruction}
          afterStatement={afterStatement}
        />
      );
    case "2":
      return (
        <Part2
          question={question as Part2QStructure}
          statement={shown}
          instruction={instruction}
          afterStatement={afterStatement}
        />
      );
    case "3":
      return (
        <Part3
          question={question as Part3QStructure}
          statement={shown}
          instruction={instruction}
          afterStatement={afterStatement}
        />
      );
    default:
      return <>Not a valid part</>;
  }
}

type PhaseProps = {
  statement: string;
  instruction?: string | null;
  afterStatement?: React.ReactNode;
};

const Part1or4 = ({
  question,
  statement,
  instruction,
  afterStatement
}: { question: NewPart1QStructure } & PhaseProps) => {
  return (
    <>
      <StatementAndTheme
        statement={statement}
        instruction={instruction}
        themes={question?.themes}
      />
      {afterStatement}
    </>
  );
};

const Part2 = ({
  question,
  statement,
  instruction,
  afterStatement
}: { question: Part2QStructure } & PhaseProps) => {
  const { image_ids } = question;

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
      <StatementAndTheme
        statement={statement}
        instruction={instruction}
        themes={question?.themes}
        smallFont
      />
      {afterStatement}
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

const Part3 = ({
  question,
  statement,
  instruction,
  afterStatement
}: { question: Part3QStructure } & PhaseProps) => {
  const { prompts } = question;
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
        <StatementAndTheme
          statement={statement}
          instruction={instruction}
          themes={question?.themes}
        />
        {afterStatement}
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
