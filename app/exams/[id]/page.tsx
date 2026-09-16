import { notFound } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";
import { BackLink } from "../ExamCards";
import ExamRunner from "./ExamRunner";

export const dynamic = "force-dynamic";

export default async function ExamPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await getExam(await getViewer(), id);

  // A private exam belonging to somebody else is indistinguishable from one
  // that does not exist.
  if (!exam) notFound();

  return (
    <div
      className="container"
      style={{ paddingTop: "3rem", flexDirection: "column" }}
    >
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: "1rem" }}>
        <BackLink href="/exams">← All practice exams</BackLink>
        <h1 style={{ marginBottom: "0.25rem" }}>{exam.title}</h1>
      </div>
      <ExamRunner exam={exam} />
    </div>
  );
}
