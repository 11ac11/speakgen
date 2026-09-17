"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Dropdown } from "@/app/components/ui";
import { SUPPORTED_LEVELS } from "@/constants";
import DashboardTable from "./DashboardTable";
import PlanPanel, { type PlanPanelProps } from "@/app/components/PlanPanel";
import SchoolPanel, { type SchoolMember } from "@/app/components/SchoolPanel";

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
  max-width: 620px;

  span {
    color: var(--lightgrey);
    font-size: 0.9rem;
  }
`;

const Empty = styled.p`
  width: 100%;
  max-width: 620px;
  color: var(--lightgrey);
  font-size: 0.95rem;

  /* globals.css sets a { color: inherit; text-decoration: none }, so an inline
     link is invisible as one without this. */
  a {
    color: var(--slategrey);
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
  exams,
  school,
  members,
  seats,
  canAdmin,
  origin
}: {
  activeTab: "questions" | "exams" | "settings";
  plan: string;
  usage: PlanPanelProps["usage"];
  billing: PlanPanelProps["billing"];
  exams: DashboardExam[];
  school: { id: string; name: string } | null;
  members: SchoolMember[];
  seats: { used: number; seats: number; pending: number };
  canAdmin: boolean;
  origin: string;
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
                  color: "var(--slategrey)",
                  fontWeight: 500,
                  fontSize: "0.9rem"
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
                    <strong>{exam.title}</strong>
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

      {activeTab === "settings" && (
        <>
          <PlanPanel plan={plan} usage={usage} billing={billing} />
          <SchoolPanel
            school={school}
            members={members}
            seats={seats}
            canAdmin={canAdmin}
            origin={origin}
          />
        </>
      )}
    </Container>
  );
}
