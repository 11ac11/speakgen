import { useEffect, useState } from "react";

interface Question {
  part: string;
  id: number;
  question: string;
  themes: string | null;
  owner_id: string;
  public: boolean;
}

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

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Part</th>
          <th>ID</th>
          <th>Question</th>
          <th>Themes</th>
          <th>Public</th>
        </tr>
      </thead>
      <tbody>
        {questions.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: "center" }}>
              No questions found.
            </td>
          </tr>
        ) : (
          questions.map((q) => (
            <tr key={`${q.part}-${q.id}`}>
              <td>{q.part}</td>
              <td>{q.id}</td>
              <td>{q.question}</td>
              <td>{q.themes || "N/A"}</td>
              <td>{q.public ? "Yes" : "No"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
