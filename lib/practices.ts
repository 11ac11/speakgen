import { sql } from "@/lib/db";
import { parseId } from "@/lib/ids";
import { getOwningOrganizationId } from "@/lib/organizations";
import {
  practiceReadPredicate,
  questionReadPredicate,
  type Viewer
} from "@/lib/questionAccess";
import {
  QUESTION_FIELDS,
  THEMES_FROM_TABLE,
  type QuestionRow
} from "@/lib/questions";

export type PracticeSummary = {
  id: number;
  level: string;
  title: string;
  owner_id: string | null;
  is_house: boolean;
  /** NULL means every part the level has. */
  part: number | null;
  question_count: number;
  /** Empty means any theme. */
  themes: string[];
};

/** A practice plus the set drawn for this run. */
export type Practice = PracticeSummary & { questions: QuestionRow[] };

/**
 * The filter a practice stores, and the only input the draw and the count both
 * need. Separated from the row so the create form can ask "how many questions
 * would this match?" before anything is saved.
 */
export type PracticeFilter = {
  level: string;
  /** NULL or undefined means every part. */
  part?: number | null;
  /** Empty means any theme. */
  themes?: string[];
};

const SELECT_PRACTICE = `
  SELECT p.id::int          AS id,
         p.level,
         p.title,
         p.owner_id,
         p.owner_id IS NULL AS is_house,
         p.part::int        AS part,
         p.question_count::int AS question_count,
         COALESCE(
           (SELECT array_agg(pt.theme_slug ORDER BY pt.theme_slug)
              FROM content.practice_themes pt
             WHERE pt.practice_id = p.id),
           '{}'
         ) AS themes
    FROM content.practices p
`;

/**
 * The WHERE that both the draw and the count run over, so the number a teacher
 * is shown while building is produced by the same predicate that later fills
 * the practice. Two spellings of this would drift, and the symptom would be a
 * practice that promises ten questions and runs seven.
 *
 * Returns a fragment plus its parameters, starting at $<nextParamIndex>, in the
 * order the caller must append them.
 */
function practicePoolPredicate(
  filter: PracticeFilter,
  viewer: Viewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  const params: unknown[] = [filter.level];
  let clause = `q.level = $${nextParamIndex}`;

  // A NULL part means every part, so the comparison is skipped rather than
  // matched against NULL, which would be false for every row.
  params.push(filter.part ?? null);
  clause += ` AND ($${nextParamIndex + 1}::smallint IS NULL
                   OR q.part = $${nextParamIndex + 1}::smallint)`;

  // Any of the chosen themes, not all of them: two themes widen the pool, they
  // do not demand a question carrying both. A question tagged with neither is
  // out.
  const themes = filter.themes?.length ? filter.themes : null;
  params.push(themes);
  clause += ` AND ($${nextParamIndex + 2}::text[] IS NULL
                   OR EXISTS (SELECT 1 FROM content.question_themes qt
                               WHERE qt.question_id = q.id
                                 AND qt.theme_slug = ANY($${nextParamIndex + 2}::text[])))`;

  const access = questionReadPredicate(viewer, nextParamIndex + 3);
  params.push(...access.params);

  return {
    clause: `q.deleted_at IS NULL AND ${clause} AND ${access.clause}`,
    params
  };
}

/**
 * How many questions this filter can draw from, for the viewer asking.
 *
 * The create form calls this on every change, because a practice that cannot be
 * filled is worth refusing at the point it is written rather than the first
 * time it is run in front of a class. C1 Part 3 has four questions, so "ten C1
 * Part 3 questions" is not a practice anyone can have yet.
 */
export async function countAvailable(
  viewer: Viewer,
  filter: PracticeFilter
): Promise<number> {
  const pool = practicePoolPredicate(filter, viewer, 1);

  const rows = (await sql(
    `SELECT count(*)::int AS n FROM content.questions q WHERE ${pool.clause}`,
    pool.params
  )) as unknown as { n: number }[];

  return rows[0]?.n ?? 0;
}

export async function listPractices(
  viewer: Viewer,
  options: { level?: string; houseOnly?: boolean } = {}
): Promise<PracticeSummary[]> {
  const params: unknown[] = [];
  let where = "";

  if (options.level) {
    params.push(options.level);
    where = `p.level = $${params.length} AND `;
  }

  if (options.houseOnly) {
    where += "p.owner_id IS NULL AND ";
  }

  const access = practiceReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  return (await sql(
    `${SELECT_PRACTICE} WHERE ${where}${access.clause}
      ORDER BY p.created_at DESC, p.id DESC`,
    params
  )) as unknown as PracticeSummary[];
}

/**
 * A practice and one draw of its questions.
 *
 * `random()` rather than a shuffle in the application: the pool can be the
 * whole level, and ordering in SQL means the rows that come back are already
 * the ones wanted. Two runs give two different sets, which is the entire point.
 */
export async function getPractice(
  viewer: Viewer,
  id: string
): Promise<Practice | null> {
  const practiceId = parseId(id);
  if (practiceId === null) return null;

  const params: unknown[] = [practiceId];
  const access = practiceReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  const rows = (await sql(
    `${SELECT_PRACTICE} WHERE p.id = $1 AND ${access.clause} LIMIT 1`,
    params
  )) as unknown as PracticeSummary[];

  const practice = rows[0];
  if (!practice) return null;

  const pool = practicePoolPredicate(
    { level: practice.level, part: practice.part, themes: practice.themes },
    viewer,
    1
  );

  const questions = (await sql(
    `SELECT ${QUESTION_FIELDS}, ${THEMES_FROM_TABLE}
       FROM content.questions q
      WHERE ${pool.clause}
      ORDER BY random()
      LIMIT $${pool.params.length + 1}`,
    [...pool.params, practice.question_count]
  )) as unknown as QuestionRow[];

  return { ...practice, questions };
}

export type PracticeInput = {
  level: string;
  title: string;
  part: number | null;
  themes: string[];
  question_count: number;
};

/**
 * Gated on content.levels.enabled the same way createExam and createQuestion
 * are, so a disabled level yields zero rows rather than a practice nobody can
 * reach.
 *
 * The themes go in from the same CTE rather than a second statement, so a
 * practice never exists briefly without them.
 */
export async function createPractice(
  ownerId: string,
  input: PracticeInput
): Promise<{ id: number } | null> {
  const organizationId = await getOwningOrganizationId(ownerId);

  const rows = (await sql(
    `WITH new_practice AS (
       INSERT INTO content.practices
         (owner_id, organization_id, level, title, part, question_count)
       SELECT $1, $2, $3, $4, $5, $6
         FROM content.levels l
        WHERE l.code = $3 AND l.enabled
       RETURNING id
     ), new_themes AS (
       INSERT INTO content.practice_themes (practice_id, theme_slug)
       SELECT new_practice.id, t.slug
         FROM new_practice, unnest($7::text[]) AS t(slug)
       RETURNING practice_id
     )
     SELECT id::int AS id FROM new_practice`,
    [
      ownerId,
      organizationId,
      input.level,
      input.title,
      input.part,
      input.question_count,
      input.themes
    ]
  )) as unknown as { id: number }[];

  return rows[0] ?? null;
}

export async function deletePractice(ownerId: string, id: string) {
  const practiceId = parseId(id);
  if (practiceId === null) return false;

  const rows = (await sql(
    `DELETE FROM content.practices
      WHERE id = $1 AND owner_id = $2
      RETURNING id`,
    [practiceId, ownerId]
  )) as unknown as { id: number }[];

  return rows.length > 0;
}
