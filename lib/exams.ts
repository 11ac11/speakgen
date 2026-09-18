import { sql } from "@/lib/db";
import { parseId } from "@/lib/ids";
import {
  getOwningOrganizationId,
  getUserOrganizationIds
} from "@/lib/organizations";
import { examReadPredicate, type Viewer } from "@/lib/questionAccess";
import type { QuestionRow } from "@/lib/questions";

export type ExamSummary = {
  id: number;
  level: string;
  title: string;
  owner_id: string | null;
  is_house: boolean;
  question_count: number;
  /** Every theme its questions carry, deduplicated. What the exam is about. */
  themes: string[];
};

export type ExamQuestion = QuestionRow & { candidate: string };

export type Exam = ExamSummary & { questions: ExamQuestion[] };

export async function listExams(
  viewer: Viewer,
  options: { level?: string; houseOnly?: boolean } = {}
): Promise<ExamSummary[]> {
  const params: unknown[] = [];
  let where = "";

  if (options.level) {
    params.push(options.level);
    where = `e.level = $${params.length} AND `;
  }

  // The free listing is a shop window, not a library of everything you can
  // reach: a teacher's own exams belong under My exams, not mixed in with the
  // house ones under a heading that says free.
  if (options.houseOnly) {
    where += "e.owner_id IS NULL AND ";
  }

  const access = examReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  return (await sql(
    `SELECT e.id::int          AS id,
            e.level,
            e.title,
            e.owner_id,
            e.owner_id IS NULL AS is_house,
            (SELECT count(*)::int FROM content.exam_questions eq
              WHERE eq.exam_id = e.id) AS question_count,
            -- The themes of the questions in it, deduplicated: an exam has no
            -- themes of its own, it inherits whatever it is built from.
            COALESCE(
              (SELECT array_agg(DISTINCT qt.theme_slug ORDER BY qt.theme_slug)
                 FROM content.exam_questions eq
                 JOIN content.question_themes qt
                   ON qt.question_id = eq.question_id
                WHERE eq.exam_id = e.id),
              '{}'
            ) AS themes
       FROM content.exams e
      WHERE ${where}${access.clause}
      ORDER BY e.owner_id IS NULL DESC, e.level, e.title`,
    params
  )) as unknown as ExamSummary[];
}

export async function getExam(
  viewer: Viewer,
  id: string
): Promise<Exam | null> {
  const examId = parseId(id);
  if (examId === null) return null;

  const params: unknown[] = [examId];
  const access = examReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  const exams = (await sql(
    `SELECT e.id::int AS id, e.level, e.title, e.owner_id,
            e.owner_id IS NULL AS is_house, 0 AS question_count,
            '{}'::text[] AS themes
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

export type ExamSlotInput = {
  part: string;
  candidate: "A" | "B" | "-";
  question_id: number;
};

/**
 * Creates an exam and its questions in one statement.
 *
 * Atomic because it is a single statement: an exam with some of its slots
 * filled is not a thing that should be able to exist. The exam row is read back
 * out of its own CTE, since a data-modifying CTE's effects are invisible to the
 * statement's own snapshot.
 *
 * Nothing here checks that the questions match the level or the part. The
 * composite foreign keys on content.exam_questions do that, and will reject the
 * insert outright.
 */
export async function createExam(
  ownerId: string,
  level: string,
  title: string,
  slots: ExamSlotInput[]
): Promise<{ id: number } | null> {
  // Belongs to the school as well as its author, when there is one.
  const organizationId = await getOwningOrganizationId(ownerId);

  const rows = (await sql(
    `WITH new_exam AS (
       INSERT INTO content.exams (owner_id, level, title, organization_id)
       SELECT $1, $2, $3, $7
         FROM content.levels l
        WHERE l.code = $2 AND l.enabled
       RETURNING id, level
     ), new_slots AS (
       INSERT INTO content.exam_questions
         (exam_id, level, part, candidate, question_id)
       SELECT new_exam.id, new_exam.level, s.part, s.candidate, s.question_id
         FROM new_exam,
              unnest($4::int[], $5::text[], $6::bigint[])
                AS s(part, candidate, question_id)
       RETURNING exam_id
     )
     SELECT id::int AS id FROM new_exam`,
    [
      ownerId,
      level,
      title,
      slots.map((s) => Number(s.part)),
      slots.map((s) => s.candidate),
      slots.map((s) => s.question_id),
      organizationId
    ]
  )) as unknown as { id: number }[];

  return rows[0] ?? null;
}

/**
 * Retitles an exam and replaces the questions in its slots.
 *
 * One statement, so an exam cannot be left half retitled or half re-slotted.
 * The slots are upserted on their primary key rather than deleted and
 * reinserted: a DELETE and an INSERT of the same rows in one statement work
 * from the same snapshot, so the INSERT would collide with rows the DELETE has
 * not yet removed as far as it can see. The removal step only takes slots the
 * new set does not mention, which is a no-op while every level's shape is
 * fixed, and correct if one ever changes.
 *
 * Returns null when the exam is not the caller's to edit, so a wrong id and
 * somebody else's exam are indistinguishable from outside.
 */
export async function updateExam(
  ownerId: string,
  id: string,
  title: string,
  slots: ExamSlotInput[]
): Promise<{ id: number } | null> {
  const examId = parseId(id);
  if (examId === null) return null;

  // Its author or a colleague at the school that owns it, exactly as deleting.
  const organizationIds = await getUserOrganizationIds(ownerId);
  const scope =
    organizationIds.length === 0
      ? { clause: `owner_id = $3`, params: [ownerId] as unknown[] }
      : {
          clause: `(owner_id = $3 OR organization_id = ANY($4::uuid[]))`,
          params: [ownerId, organizationIds] as unknown[]
        };

  // $1 and $2 are the id and the title; the scope takes what follows, and the
  // three slot arrays come after that.
  const base = 2 + scope.params.length;

  const rows = (await sql(
    `WITH target AS (
       UPDATE content.exams
          SET title = $2
        WHERE id = $1 AND ${scope.clause}
        RETURNING id, level
     ), slot AS (
       SELECT * FROM unnest($${base + 1}::int[], $${base + 2}::text[], $${base + 3}::bigint[])
         AS s(part, candidate, question_id)
     ), upserted AS (
       INSERT INTO content.exam_questions
         (exam_id, level, part, candidate, question_id)
       SELECT t.id, t.level, s.part, s.candidate, s.question_id
         FROM target t, slot s
       ON CONFLICT (exam_id, part, candidate)
         DO UPDATE SET question_id = EXCLUDED.question_id
       RETURNING 1
     ), removed AS (
       DELETE FROM content.exam_questions eq
        USING target t
        WHERE eq.exam_id = t.id
          AND NOT EXISTS (
            SELECT 1 FROM slot s
             WHERE s.part = eq.part AND s.candidate = eq.candidate
          )
       RETURNING 1
     )
     SELECT id::int AS id FROM target`,
    [
      examId,
      title,
      ...scope.params,
      slots.map((s) => Number(s.part)),
      slots.map((s) => s.candidate),
      slots.map((s) => s.question_id)
    ]
  )) as unknown as { id: number }[];

  return rows[0] ?? null;
}

/**
 * Hard delete, unlike questions. An exam is a container rather than content:
 * nothing else references it, and its rows cascade.
 */
export async function deleteExam(ownerId: string, id: string) {
  const examId = parseId(id);
  if (examId === null) return null;

  // Its author or a colleague at the school that owns it. House exams have no
  // owner and no organisation, so neither branch reaches them.
  const organizationIds = await getUserOrganizationIds(ownerId);
  const scope =
    organizationIds.length === 0
      ? { clause: `owner_id = $2`, params: [ownerId] }
      : {
          clause: `(owner_id = $2 OR organization_id = ANY($3::uuid[]))`,
          params: [ownerId, organizationIds]
        };

  const rows = (await sql(
    `DELETE FROM content.exams
      WHERE id = $1 AND ${scope.clause}
      RETURNING id::int AS id`,
    [examId, ...scope.params]
  )) as unknown as { id: number }[];

  return rows[0] ?? null;
}
