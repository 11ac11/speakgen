"use client";

import React from "react";
import { QuickStart } from "./components/ui";
import styled from "styled-components";

const Container = styled.div`
  flex-direction: row;

  h1 {
    margin-top: 0;
  }
`;

const LeftSide = styled.div`
  width: 70%;

  p {
    font-size: 16px;
    margin-bottom: 40px;
  }
`;

const RightSide = styled.div`
  width: 30%;
  align-self: flex-start;
`;

export default function Home() {
  return (
    <Container className={"container"}>
      <LeftSide>
        <h1>Welcome to Speakgen</h1>
        <h3>What is Speakgen?</h3>
        <p>
          Speakgen is an application which allows you to simulate the cambridge
          speaking exams. It can be used by both teachers and students.
        </p>
        <h3>Do I need an account?</h3>
        <p>
          You can use the basic functionality of speakgen without an account,
          but in order to create questions and sets, you will need to create an
          account.
        </p>
        <h3>What can I do with an account?</h3>
        <p>You can create your own questions & your own question sets.</p>
        <h3>What is a question set?</h3>
        <p>
          A question set can be in the traditional exam style (part 1, 2, 3, 4)
          or you can create a set of only part 2 questions. You can focus on
          specific topics to fit in with any current themes that are currently
          being learnt.
        </p>
      </LeftSide>
      <RightSide>
        <QuickStart />
      </RightSide>
    </Container>
  );
}
