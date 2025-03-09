import React from "react";
// import {
//   getPartOneQuestions,
//   getRandomPartOneQuestion,
// } from "../../services/part1Service";
// import PartOneQuestion from "../../components/PartOneQuestion";
import QuestionContainer from "../../components/QuestionContainer2";
import { getRandomPartOneQuestion } from "../../services/part1Service";

export default async function SpeakingOne() {
  // have instructions here for the part
  // pass the questions as props to the question container, then render a singular question inside that
  // const newQuestion = await getRandomPartOneQuestion();

  return <QuestionContainer />;
}
