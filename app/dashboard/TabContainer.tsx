"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Dropdown } from "@/app/components/ui";
import { SUPPORTED_LEVELS } from "@/constants";
import DashboardTable from "./DashboardTable";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

const ExamsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;

  span {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
`;

const Empty = styled.p`
  width: 100%;
  color: var(--text-muted);
  font-size: var(--text-base);

  /* globals.css sets a { color: inherit; text-decoration: none }, so an inline
     link is invisible as one without this. */
  a {
    color: var(--text-body);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    color: var(--leafgreen);
  }
`;

const ExamList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: grid;
  gap: 0.75rem;
`;

const ExamCard = styled(Link)`
  display: block;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-card);
  color: var(--text-body);
  text-decoration: none;

  h3 {
    font-size: var(--text-lg);
    color: var(--text-heading);
    margin: 0;
  }

  &:hover,
  &:active {
    color: var(--text-body);
  }

  span {
    display: block;
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-top: 0.25rem;
  }
`;

export type DashboardExam = {
  id: number;
  level: string;
  title: string;
  question_count: number;
};

export default function TabContainer({
  activeTab,
  usage,
  exams
}: {
  activeTab: "questions" | "exams";
  usage: { exams: { used: number; limit: number | null } };
  exams: DashboardExam[];
}) {
  const router = useRouter();

  const atExamLimit =
    usage.exams.limit !== null && usage.exams.used >= usage.exams.limit;

  // The builder lives under a level, so creating one starts by choosing which.
  const startExam = (level: string) =>
    router.push(`/${level.toLowerCase()}/exams/new`);

  return (
    <Container>
      {activeTab === "questions" && <DashboardTable />}

      {activeTab === "exams" && (
        <>
          <ExamsHeader>
            <span>
              {usage.exams.limit === null
                ? `${usage.exams.used} exams`
                : `${usage.exams.used} of ${usage.exams.limit} exams used`}
            </span>
            {atExamLimit ? (
              <Link
                href="/pricing"
                className="glass"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.6rem",
                  color: "var(--text-body)",
                  fontWeight: 500,
                  fontSize: "var(--text-sm)"
                }}
              >
                Upgrade for more exams
              </Link>
            ) : (
              <Dropdown
                options={SUPPORTED_LEVELS}
                value={""}
                onChange={startExam}
                placeholder="New exam"
                width={"160px"}
                inputAsButton
                isDashboardButton
              />
            )}
          </ExamsHeader>

          {exams.length === 0 ? (
            <Empty>
              You have not built an exam yet. Choose a level above to start one,
              or <Link href="/b2/exams">browse the free ones</Link>.
            </Empty>
          ) : (
            <ExamList>
              {exams.map((exam) => (
                <li key={exam.id}>
                  <ExamCard
                    href={`/${exam.level}/exams/${exam.id}`}
                    className="glass"
                  >
                    <h3>{exam.title}</h3>
                    <span>
                      {`${exam.level.toUpperCase()} · ${exam.question_count} questions`}
                    </span>
                  </ExamCard>
                </li>
              ))}
            </ExamList>
          )}
        </>
      )}
    </Container>
  );
}
