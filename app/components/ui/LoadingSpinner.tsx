"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingCircle = styled.div`
  width: 30px;
  height: 30px;
  max-width: 80px;
  aspect-ratio: 1;
  border: 5px solid grey;
  border-radius: 50%;
  border-top: 5px solid black;
  animation: ${spinAnimation} 1s linear infinite;
  margin: 1rem 0;
`;

export const LoadingSpinner = ({}) => {
  return (
    <Container>
      <LoadingCircle />
    </Container>
  );
};
