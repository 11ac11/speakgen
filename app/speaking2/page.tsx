import React from "react";
import QuestionContainer from "@/app/components/QuestionContainer";
import { part2data } from "../../dataPart2";

export default function SpeakingTwo() {
  return <QuestionContainer questions={part2data} />;
}
