import React from "react";
import SubmitQuestionForm from "../../../components/SubmitQuestionForm";

const getQuestion = async (part: string, id: string) => {
  console.log("get question:");
  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${part}/${id}`,
  //   {
  //     cache: "no-store", // Ensure fresh data
  //   }
  // );

  // if (!res.ok) {
  //   throw new Error("Failed to fetch question");
  // }

  // return res.json();
};

const EditQuestion = async ({
  params,
}: {
  params: { id: string; part: string };
}) => {
  const question = await getQuestion(params.part, params.id);

  return <SubmitQuestionForm question={question} />;
};

export default EditQuestion;
