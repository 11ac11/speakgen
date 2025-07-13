import React from "react";
import Question from "@/app/components/Question";

const getRandomQuestion = async (level: string, part: string) => {
  console.log("Fetching question:", level, part);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/questions/${level}/${part}?random=true`;

  const res = await fetch(apiUrl, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch question");
  }

  return res.json();
};

// // ✅ Fetch data at the top level instead of inside the component
// const EditQuestion = async ({
//   params,
// }: {
//   params: Promise<{ id: string; part: string; level: string }>;
// }) => {
//   const { part, id, level } = await params; // Destructure to ensure params are awaited

//   const question = await getQuestion(level, part, id);

//   return (
//     <QuestionForm
//       question={question}
//       partParam={part}
//       levelParam={level.toUpperCase()}
//     />
//   );
// };

// export default EditQuestion;

export const ShowQuestion = async ({
  params,
}: {
  params: Promise<{ id: string; part: string; level: string }>;
}) => {
  console.log("hitting");
  const { part, level } = await params; // Destructure to ensure params are awaited

  const question = await getRandomQuestion(level, part);
  console.log("question:", question);

  return (
    <Question
      question={question}
      theme={question.themes[0] || ""}
      part={part}
    />
  );
};

export default ShowQuestion;
