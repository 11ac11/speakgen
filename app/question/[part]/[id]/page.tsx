import SubmitQuestionForm from "@/app/components/SubmitQuestionForm";

const getQuestion = async (part: string, id: string) => {
  console.log("Fetching question:", part, id);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/questions/${part}/${id}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  console.log("res:", res);

  if (!res.ok) {
    throw new Error("Failed to fetch question");
  }

  return res.json();
};

// ✅ Fetch data at the top level instead of inside the component
const EditQuestion = async ({
  params,
}: {
  params: { id: string; part: string };
}) => {
  const { part, id } = await params; // Destructure to ensure params are awaited

  const question = await getQuestion(part, id);
  console.log("question:", question);

  return (
    <SubmitQuestionForm
      question={question}
      partParam={part}
      levelParam={"B2"}
    />
  );
};

export default EditQuestion;
