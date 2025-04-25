import React from "react";
import QuestionContainer from "@/app/components/QuestionContainer";
import { part3data } from "../../dataPart3";

export default function SpeakingThree() {
  return <QuestionContainer questions={part3data} />;
}
