import { useEffect, useState } from "react";
import styled from "styled-components";
import Pill from "./Pill";

interface Question {
  part: string;
  id: number;
  question: string;
  themes: string[] | null;
  owner_id: string;
  public: boolean;
}

const TableRow = styled.tr`
  height: 30px;
`;

const TableHeader = styled.th`
  text-align: left;
  max-width: 50px;
`;

const TableData = styled.td`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50px;
`;

export default function QuestionsTable({ ownerId }: { ownerId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/questions/all?owner_id=${ownerId}`);
        if (!res.ok) throw new Error("Failed to load questions");
        const data: Question[] = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (ownerId) {
      fetchQuestions();
    }
  }, [ownerId]);

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log("test:");

  return (
    <table
      style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}
    >
      <thead>
        <TableRow>
          <TableHeader>Part</TableHeader>
          <TableHeader>Question</TableHeader>
          <TableHeader>Themes</TableHeader>
          <TableHeader>Public</TableHeader>
        </TableRow>
      </thead>
      <tbody>
        {questions.length === 0 ? (
          <TableRow>
            <td colSpan={5} style={{ textAlign: "center" }}>
              No questions found.
            </td>
          </TableRow>
        ) : (
          questions.map((q) => (
            <TableRow key={`${q.part}-${q.id}`}>
              <TableData>
                <Pill text={`Part ${q.part}`} />
              </TableData>
              <TableData>{q.question}</TableData>
              <TableData>
                {q?.themes?.map((theme) => {
                  return <Pill text={theme} useLightPalette key={theme} />;
                }) || "N/A"}
              </TableData>
              <TableData>{q.public ? "Yes" : "No"}</TableData>
            </TableRow>
          ))
        )}
      </tbody>
    </table>
  );
}
