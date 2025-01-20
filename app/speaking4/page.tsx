import React from "react";
import QuestionContainer from "../../components/QuestionContainer";
import ConnectionTest from "./connectionTest";
import { part4data } from "../../dataPart4";
import { GET } from "../api/aws-rds/route";

export default async function SpeakingFour() {
  const result = await GET();
  console.log("result:", result);
  return (
    <>
      <ConnectionTest />
      <QuestionContainer questions={part4data} />
    </>
  );
}
