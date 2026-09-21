"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Dropdown } from "@/app/components/ui";
import { SUPPORTED_LEVELS } from "@/constants";
import DashboardTable from "./DashboardTable";
import { ExamThemes } from "@/app/components/ExamCards";
import RowMenu from "@/app/components/ui/RowMenu";

/* stretch, not center: the page sets the measure now, so everything inside
   lines up on the same left edge instead of each block centring itself at
   whatever width its contents happen to be. */
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
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

/* The card is one big link, so Edit cannot live inside it — an anchor inside
   an anchor is not valid and browsers unpick it. It sits over the card as a
   sibling instead, which also keeps the whole card clickable for running the
   exam rather than shrinking the target to the title. */
const ExamCardWrap = styled.div`
  position: relative;
`;

const CardMenu = styled(RowMenu)`
  position: absolute;
  top: 0.8rem;
  right: 0.9rem;
  z-index: 1;
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
    /* Clear of the Edit control sitting in the corner. */
    padding-right: 4.5rem;
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
  themes: string[];
};

export type DashboardPractice = {
  id: number;
  level: string;
  title: string;
  /** NULL means every part the level has. */
  part: number | null;
  question_count: number;
  themes: string[];
};

export default function TabContainer({
  activeTab,
  usage,
  exams,
  practices
}: {
  activeTab: "questions" | "exams" | "practices";
  usage: {
    exams: { used: number; limit: number | null };
    practices: { used: number; limit: number | null };
  };
  exams: DashboardExam[];
  practices: DashboardPractice[];
}) {
  const router = useRouter();
  const [examError, setExamError] = useState<string | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const handleDeleteExam = async (id: number) => {
    setExamError(null);
    try {
      const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setExamError(body?.error ?? "Could not delete that exam.");
        return;
      }
      // The list came from the server, so it is the server that has to redraw
      // it — and the exam count in the header along with it.
      router.refresh();
    } catch {
      setExamError("Could not delete that exam. Please try again.");
    }
  };

  const handleDeletePractice = async (id: number) => {
    setPracticeError(null);
    try {
      const res = await fetch(`/api/practices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setPracticeError(body?.error ?? "Could not delete that practice.");
        return;
      }
      router.refresh();
    } catch {
      setPracticeError("Could not delete that practice. Please try again.");
    }
  };

  const atExamLimit =
    usage.exams.limit !== null && usage.exams.used >= usage.exams.limit;
  const atPracticeLimit =
    usage.practices.limit !== null &&
    usage.practices.used >= usage.practices.limit;

  // The builder lives under a level, so creating one starts by choosing which.
  const startExam = (level: string) =>
    router.push(`/${level.toLowerCase()}/exams/new`);
  const startPractice = (level: string) =>
    router.push(`/${level.toLowerCase()}/practices/new`);

  /* What the practice draws, in the words the builder used. The count is the
     rule's, not a number of rows that exist: a practice holds no questions. */
  const practiceSummary = (practice: DashboardPractice) =>
    `${practice.level.toUpperCase()} · ${
      practice.part === null ? "any part" : `Part ${practice.part}`
    } · ${practice.question_count} questions, redrawn each run`;

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

          {examError ? (
            <Empty role="alert" style={{ color: "var(--danger)" }}>
              {examError}
            </Empty>
          ) : null}

          {exams.length === 0 ? (
            <Empty>
              You have not built an exam yet. Choose a level above to start one,
              or <Link href="/b2/exams">browse the free ones</Link>.
            </Empty>
          ) : (
            <ExamList>
              {exams.map((exam) => (
                <li key={exam.id}>
                  <ExamCardWrap>
                    <ExamCard
                      href={`/${exam.level}/exams/${exam.id}`}
                      className="glass"
                    >
                      <h3>{exam.title}</h3>
                      <span>
                        {`${exam.level.toUpperCase()} · ${exam.question_count} questions`}
                      </span>
                      <ExamThemes themes={exam.themes} />
                    </ExamCard>
                    <CardMenu
                      ariaLabel={`Actions for ${exam.title}`}
                      items={[
                        {
                          label: "Edit",
                          href: `/${exam.level}/exams/${exam.id}/edit`
                        },
                        {
                          label: "Delete",
                          danger: true,
                          /* Asked, unlike deleting a question: an exam is
                             removed outright rather than soft-deleted, so
                             there is nothing to put back. */
                          confirm: `Delete "${exam.title}"?`,
                          onSelect: () => handleDeleteExam(exam.id)
                        }
                      ]}
                    />
                  </ExamCardWrap>
                </li>
              ))}
            </ExamList>
          )}
        </>
      )}

      {activeTab === "practices" && (
        <>
          <ExamsHeader>
            <span>
              {usage.practices.limit === null
                ? `${usage.practices.used} practices`
                : `${usage.practices.used} of ${usage.practices.limit} practices used`}
            </span>
            {atPracticeLimit ? (
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
                Upgrade for more practices
              </Link>
            ) : (
              <Dropdown
                options={SUPPORTED_LEVELS}
                value={""}
                onChange={startPractice}
                placeholder="New practice"
                width={"180px"}
                inputAsButton
                isDashboardButton
              />
            )}
          </ExamsHeader>

          {practiceError ? (
            <Empty role="alert" style={{ color: "var(--danger)" }}>
              {practiceError}
            </Empty>
          ) : null}

          {practices.length === 0 ? (
            <Empty>
              You have not made a practice yet. A practice is a rule rather than
              a fixed list — it draws a new set of questions every time you run
              it. Choose a level above to start one.
            </Empty>
          ) : (
            <ExamList>
              {practices.map((practice) => (
                <li key={practice.id}>
                  <ExamCardWrap>
                    <ExamCard
                      href={`/${practice.level}/practices/${practice.id}`}
                      className="glass"
                    >
                      <h3>{practice.title}</h3>
                      <span>{practiceSummary(practice)}</span>
                      <ExamThemes themes={practice.themes} />
                    </ExamCard>
                    <CardMenu
                      ariaLabel={`Actions for ${practice.title}`}
                      items={[
                        {
                          label: "Edit",
                          href: `/${practice.level}/practices/${practice.id}/edit`
                        },
                        {
                          label: "Delete",
                          danger: true,
                          confirm: `Delete "${practice.title}"?`,
                          onSelect: () => handleDeletePractice(practice.id)
                        }
                      ]}
                    />
                  </ExamCardWrap>
                </li>
              ))}
            </ExamList>
          )}
        </>
      )}
    </Container>
  );
}
