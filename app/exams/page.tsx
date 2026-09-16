import Link from "next/link";
import { listExams } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";
import { CAMBRIDGE_SPEAKING_BLUEPRINTS } from "@/lib/cambridgeBlueprints";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const exams = await listExams(await getViewer());

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1>Practice exams</h1>
        <p style={{ marginBottom: "2rem" }}>
          Full Cambridge speaking tests, run straight through. Free ones need no
          account.
        </p>

        {exams.length === 0 ? (
          <p>No exams yet.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "grid",
              gap: "1rem"
            }}
          >
            {exams.map((exam) => {
              const blueprint =
                CAMBRIDGE_SPEAKING_BLUEPRINTS[
                  exam.level as keyof typeof CAMBRIDGE_SPEAKING_BLUEPRINTS
                ];

              return (
                <li key={exam.id}>
                  <Link
                    href={`/exams/${exam.id}`}
                    className="glass"
                    style={{
                      display: "block",
                      padding: "1.25rem 1.5rem",
                      borderRadius: "1rem",
                      textDecoration: "none"
                    }}
                  >
                    <strong style={{ fontSize: "1.2rem" }}>{exam.title}</strong>
                    <div style={{ opacity: 0.75, marginTop: "0.4rem" }}>
                      {exam.level.toUpperCase()}
                      {blueprint ? ` · ${blueprint.qualification}` : ""}
                      {` · ${exam.question_count} questions`}
                      {blueprint
                        ? ` · ~${blueprint.speakingPairMinutes} min`
                        : ""}
                      {exam.is_house ? " · Free" : ""}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
