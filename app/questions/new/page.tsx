import QuestionForm from "@/app/components/QuestionForm";

// Deliberately not under /[level]: a new question has no level until the form
// picks one, and the form lets you change it while writing.
export default function NewQuestionPage() {
  return <QuestionForm />;
}
