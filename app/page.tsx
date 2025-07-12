"use client";

import React from "react";
import { QuickStart } from "./components/ui";
import Image from "next/image";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 10%;

  h1 {
    margin-top: 0;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  display: flex;
  align-items: center;

  p {
    font-size: 16px;
    margin-bottom: 40px;
  }

  @media only screen and (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LeftSide = styled.div`
  flex: 10;
  padding-right: 2rem;
`;

const RightSide = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3rem;

  @media only screen and (max-width: 600px) {
    font-size: 2.4rem;
  }

  @media only screen and (max-width: 400px) {
    font-size: 2rem;
  }
`;

const SubTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 200;
  margin: 0 0 2rem 0;

  @media only screen and (max-width: 600px) {
    font-size: 1.2rem;
  }

  @media only screen and (max-width: 400px) {
    font-size: 1rem;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 400px;
  height: 350px;
  align-self: flex-start;
  border-radius: 10px;

  @media only screen and (max-width: 900px) {
    margin-top: 2rem;
    width: 80vw;
  }
`;

export default function Landing() {
  return (
    <Container className={"container"}>
      <HeroContainer>
        <LeftSide>
          <Title>Level Up Your English Speaking—With Speakgen</Title>
          <SubTitle>
            Realistic English Speaking Exam Practice for Students and Teachers.
          </SubTitle>
          <QuickStart />
        </LeftSide>
        <RightSide>
          <ImageContainer>
            <Image
              src="/speech-bubbles-sky.jpg"
              alt="Speech bubbles"
              fill
              style={{ objectFit: "cover", borderRadius: "10px" }}
            />
          </ImageContainer>
        </RightSide>
      </HeroContainer>
    </Container>
  );
}
