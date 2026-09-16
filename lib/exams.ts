import { sql } from "@/lib/db";
import { examReadPredicate, type Viewer } from "@/lib/questionAccess";
import type { QuestionRow } from "@/lib/questions";

export type ExamSummary = {
  id: number;
  level: string;
  title: string;
  owner_id: string | null;
  is_house: boolean;
  question_count: number;
};

export type ExamQuestion = QuestionRow & { candidate: string };

export type Exam = ExamSummary & { questions: ExamQuestion[] };

export async function listExams(viewer: Viewer): Promise<ExamSummary[]> {
  const access = examReadPredicate(viewer, 1);

  return (await sql(
    `SELECT e.id::int          AS id,
            e.level,
            e.title,
            e.owner_id,
            e.owner_id IS NULL AS is_house,
            (SELECT count(*)::int FROM content.exam_questions eq
              WHERE eq.exam_id = e.id) AS question_count
       FROM content.exams e
      WHERE ${access.clause}
      ORDER BY e.owner_id IS NULL DESC, e.level, e.title`,
    access.params
  )) as unknown as ExamSummary[];
}

export async function getExam(
  viewer: Viewer,
  id: string
): Promise<Exam | null> {
  const params: unknown[] = [Number(id)];
  const access = examReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  const exams = (await sql(
    `SELECT e.id::int AS id, e.level, e.title, e.owner_id,
            e.owner_id IS NULL AS is_house, 0 AS question_count
       FROM content.exams e
      WHERE e.id = $1 AND ${access.clause}
      LIMIT 1`,
    params
  )) as unknown as ExamSummary[];

  const exam = exams[0];
  if (!exam) return null;

  // Reading the exam is what grants access to its questions, so no per-question
  // visibility check here. See examReadPredicate.
  const questions = (await sql(
    `SELECT q.id::int                 AS id,
            q.level,
            q.part::text              AS part,
            q.statement,
            q.statement_two,
            q.follow_up,
            q.decision,
            q.prompts,
            q.image_ids,
            q.instructions,
            q.owner_id,
            q.needs_review,
            (q.visibility = 'public') AS public,
            eq.candidate,
            COALESCE(
              (SELECT array_agg(qt.theme_slug ORDER BY qt.theme_slug)
                 FROM content.question_themes qt
                WHERE qt.question_id = q.id),
              '{}'
            )                         AS themes
       FROM content.exam_questions eq
       JOIN content.questions q ON q.id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq.part, eq.candidate`,
    [exam.id]
  )) as unknown as ExamQuestion[];

  return { ...exam, questions, question_count: questions.length };
}
