import QuestionForm from "@/app/components/QuestionForm";

const getQuestion = async (level: string, part: string, id: string) => {
  console.log("Fetching question:", level, part, id);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/questions/${level}/${part}/${id}`;

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
  params: Promise<{ id: string; part: string; level: string }>;
}) => {
  const { part, id, level } = await params; // Destructure to ensure params are awaited

  const question = await getQuestion(level, part, id);

  return (
    <QuestionForm
      question={question}
      partParam={part}
      levelParam={level.toUpperCase()}
    />
  );
};

export default EditQuestion;
