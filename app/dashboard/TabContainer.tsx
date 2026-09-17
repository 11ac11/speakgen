"use client";

import Link from "next/link";
import styled from "styled-components";
import DashboardTable from "./DashboardTable";
import PlanPanel, { type PlanPanelProps } from "@/app/components/PlanPanel";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

const ExamList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 620px;
  display: grid;
  gap: 0.75rem;
`;

const ExamCard = styled(Link)`
  display: block;
  padding: 1rem 1.25rem;
  border-radius: 0.9rem;
  color: var(--slategrey);
  text-decoration: none;

  &:hover,
  &:active {
    color: var(--slategrey);
  }

  span {
    display: block;
    color: var(--lightgrey);
    font-size: 0.85rem;
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
  plan,
  usage,
  billing,
  exams
}: {
  activeTab: "questions" | "exams" | "settings";
  plan: string;
  usage: PlanPanelProps["usage"];
  billing: PlanPanelProps["billing"];
  exams: DashboardExam[];
}) {
  return (
    <Container>
      {activeTab === "questions" && <DashboardTable />}

      {activeTab === "exams" &&
        (exams.length === 0 ? (
          <p>
            {"You have not built an exam yet. "}
            <Link href="/b2/exams">Browse exams</Link>
            {" to start one."}
          </p>
        ) : (
          <ExamList>
            {exams.map((exam) => (
              <li key={exam.id}>
                <ExamCard
                  href={`/${exam.level}/exams/${exam.id}`}
                  className="glass"
                >
                  <strong>{exam.title}</strong>
                  <span>
                    {`${exam.level.toUpperCase()} · ${exam.question_count} questions`}
                  </span>
                </ExamCard>
              </li>
            ))}
          </ExamList>
        ))}

      {activeTab === "settings" && (
        <PlanPanel plan={plan} usage={usage} billing={billing} />
      )}
    </Container>
  );
}
