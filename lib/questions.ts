import { sql } from "@/lib/db";
import { parseId } from "@/lib/ids";
import {
  getOwningOrganizationId,
  getUserOrganizationIds
} from "@/lib/organizations";
import { questionReadPredicate, type Viewer } from "@/lib/questionAccess";
import type { QuestionPayload } from "@/lib/questionRules";

/**
 * Every query against content.questions lives here. Nothing else builds SQL for
 * questions, so the read predicate in questionAccess.ts cannot be bypassed.
 *
 * The wire format is deliberately unchanged from the legacy level.part tables:
 * themes still come back as a string[], visibility still comes back as a
 * `public` boolean, and id is cast to int. Only storage changed in this pass.
 */

export const QUESTION_FIELDS = `
  q.id::int                  AS id,
  q.level,
  q.part::text               AS part,
  q.statement,
  q.statement_two,
  q.follow_up,
  q.decision,
  q.prompts,
  q.image_ids,
  q.instructions,
  q.owner_id,
  q.needs_review,
  (q.visibility = 'public')  AS public
`;

export const THEMES_FROM_TABLE = `
  COALESCE(
    (SELECT array_agg(qt.theme_slug ORDER BY qt.theme_slug)
       FROM content.question_themes qt
      WHERE qt.question_id = q.id),
    '{}'
  ) AS themes
`;

const SELECT_QUESTION = `
  SELECT ${QUESTION_FIELDS}, ${THEMES_FROM_TABLE} FROM content.questions q
`;

const NOT_DELETED = `q.deleted_at IS NULL`;

export type QuestionRow = {
  id: number;
  level: string;
  part: string;
  statement: string;
  statement_two: string | null;
  follow_up: string | null;
  decision: string | null;
  prompts: string[];
  image_ids: number[];
  instructions: string[];
  owner_id: string | null;
  needs_review: boolean;
  public: boolean;
  themes: string[];
};

/** Postgres foreign key violation: an unknown theme slug, level or part. */
function isForeignKeyViolation(error: unknown) {
  return (error as { code?: string })?.code === "23503";
}

function isCheckViolation(error: unknown) {
  return (error as { code?: string })?.code === "23514";
}

export class InvalidReferenceError extends Error {}

/**
 * A CHECK constraint refused the row: a Part 2 without its photographs, a Part
 * 3 without its prompts, house content marked private.
 *
 * Only reached when something got past the request schema, which mirrors those
 * rules — an update that strips a field, or a caller that is not the app. It
 * exists so that case is a 400 rather than a 500: the request is wrong, not
 * the server.
 */
export class ConstraintViolationError extends Error {}

/** Names the constraint in words, so a caller is not handed Postgres internals. */
const CONSTRAINT_MESSAGES: Record<string, string> = {
  questions_p2_images: "A Part 2 question needs between 2 and 5 photographs",
  questions_p3_prompts: "A Part 3 question needs between 3 and 5 prompts",
  questions_public_is_house: "Only house questions can be public"
};

async function run(query: string, params: unknown[]) {
  try {
    return (await sql(query, params)) as unknown as QuestionRow[];
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new InvalidReferenceError("Unknown theme, level or part");
    }

    if (isCheckViolation(error)) {
      const name = (error as { constraint?: string }).constraint ?? "";
      throw new ConstraintViolationError(
        CONSTRAINT_MESSAGES[name] ?? "That question is not a valid shape"
      );
    }

    throw error;
  }
}

export async function listQuestions(
  viewer: Viewer,
  options: { level: string; part: string; random?: boolean }
) {
  const part = parseId(options.part);
  if (part === null) return [];

  const params: unknown[] = [options.level, part];
  const access = questionReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  return run(
    `${SELECT_QUESTION}
      WHERE ${NOT_DELETED} AND q.level = $1 AND q.part = $2 AND ${access.clause}
      ORDER BY ${options.random ? "random()" : "q.id"}
      ${options.random ? "LIMIT 1" : ""}`,
    params
  );
}

export async function getQuestionById(viewer: Viewer, id: string) {
  const questionId = parseId(id);
  if (questionId === null) return null;

  const params: unknown[] = [questionId];
  const access = questionReadPredicate(viewer, params.length + 1);
  params.push(...access.params);

  const rows = await run(
    `${SELECT_QUESTION} WHERE ${NOT_DELETED} AND q.id = $1 AND ${access.clause} LIMIT 1`,
    params
  );
  return rows[0] ?? null;
}

/** The dashboard: a teacher's own questions. House content is not theirs. */
export async function listOwnedQuestions(
  ownerId: string,
  options: { level?: string; part?: string } = {}
) {
  const params: unknown[] = [ownerId];
  let where = `${NOT_DELETED} AND q.owner_id = $1`;

  if (options.level) {
    params.push(options.level);
    where += ` AND q.level = $${params.length}`;
  }
  if (options.part) {
    const part = parseId(options.part);
    if (part === null) return [];
    params.push(part);
    where += ` AND q.part = $${params.length}`;
  }

  return run(
    `${SELECT_QUESTION} WHERE ${where} ORDER BY q.level, q.part, q.id`,
    params
  );
}

export async function createQuestion(
  ownerId: string,
  level: string,
  part: string,
  payload: QuestionPayload
) {
  const partNumber = parseId(part);
  if (partNumber === null) return null;

  // Content written inside a school belongs to the school as well as its
  // author, so it stays when the author leaves.
  const organizationId = await getOwningOrganizationId(ownerId);

  // The insert is gated on content.levels.enabled, so a disabled level yields
  // zero rows rather than a question nobody can reach. The (level, part)
  // foreign key rejects a part the level does not have, e.g. a C2 Part 4.
  const rows = await run(
    // The new rows are read back out of the CTEs, not out of the tables. A
    // data-modifying CTE's effects are invisible to the statement's own
    // snapshot, so selecting from content.questions here would find nothing.
    `WITH inserted AS (
       INSERT INTO content.questions
         (level, part, owner_id, visibility, statement, statement_two,
          follow_up, decision, prompts, image_ids, instructions,
          organization_id)
       SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $13
         FROM content.levels l
        WHERE l.code = $1 AND l.enabled
       RETURNING *
     ), tagged AS (
       INSERT INTO content.question_themes (question_id, theme_slug)
       SELECT inserted.id, unnest($12::text[]) FROM inserted
       RETURNING theme_slug
     )
     SELECT ${QUESTION_FIELDS},
            COALESCE(
              (SELECT array_agg(t.theme_slug ORDER BY t.theme_slug) FROM tagged t),
              '{}'
            ) AS themes
       FROM inserted q`,
    [
      level,
      partNumber,
      ownerId,
      // Always private: public is house content only, and house content is
      // not written through here. questions_public_is_house holds it.
      "private",
      payload.statement,
      payload.statement_two ?? null,
      payload.follow_up ?? null,
      payload.decision ?? null,
      payload.prompts ?? [],
      payload.image_ids ?? [],
      payload.instructions ?? [],
      payload.themes,
      organizationId
    ]
  );
  return rows[0] ?? null;
}

export async function updateQuestion(
  ownerId: string,
  id: string,
  payload: Partial<QuestionPayload>
) {
  const questionId = parseId(id);
  if (questionId === null) return null;

  const scope = await writeScope(ownerId, 2);
  const sets: string[] = [];
  const params: unknown[] = [questionId, ...scope.params];

  const assign = (column: string, value: unknown) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (payload.statement !== undefined) assign("statement", payload.statement);
  if (payload.statement_two !== undefined)
    assign("statement_two", payload.statement_two);
  if (payload.follow_up !== undefined) assign("follow_up", payload.follow_up);
  if (payload.decision !== undefined) assign("decision", payload.decision);
  if (payload.prompts !== undefined) assign("prompts", payload.prompts);
  if (payload.image_ids !== undefined) assign("image_ids", payload.image_ids);
  if (payload.instructions !== undefined)
    assign("instructions", payload.instructions);

  // updated_at is maintained by the questions_touch trigger, so an update that
  // only changes themes still needs to touch the row to be visible as a change.
  if (sets.length === 0) sets.push(`updated_at = now()`);

  // Themes are synced rather than replaced: insert the ones that are missing,
  // delete the ones no longer listed. A delete-then-insert in the same
  // statement would collide, because data-modifying CTEs do not see each
  // other's effects, and a re-saved theme would be dropped.
  const syncThemes = payload.themes !== undefined;
  const themesParam = syncThemes ? `$${params.length + 1}::text[]` : null;
  if (syncThemes) params.push(payload.themes);

  const rows = await run(
    `WITH updated AS (
       UPDATE content.questions
          SET ${sets.join(", ")}
        WHERE id = $1 AND ${scope.clause} AND deleted_at IS NULL
        RETURNING *
     )${
       syncThemes
         ? `, added AS (
       INSERT INTO content.question_themes (question_id, theme_slug)
       SELECT updated.id, unnest(${themesParam}) FROM updated
       ON CONFLICT (question_id, theme_slug) DO NOTHING
       RETURNING theme_slug
     ), removed AS (
       DELETE FROM content.question_themes
        WHERE question_id IN (SELECT id FROM updated)
          AND theme_slug <> ALL(${themesParam})
       RETURNING theme_slug
     )`
         : ""
     }
     SELECT ${QUESTION_FIELDS}, ${
       // When themes were synced, the table's own rows are not yet visible to
       // this snapshot, so the new set is read back from the parameter.
       syncThemes
         ? `COALESCE((SELECT array_agg(x ORDER BY x) FROM unnest(${themesParam}) x), '{}') AS themes`
         : THEMES_FROM_TABLE
     }
       FROM updated q`,
    params
  );
  return rows[0] ?? null;
}

/**
 * Who may change a question: its author, or a colleague at the school that owns
 * it. A shared bank that only its author can edit is not shared.
 */
async function writeScope(userId: string, firstParamIndex: number) {
  const organizationIds = await getUserOrganizationIds(userId);

  if (organizationIds.length === 0) {
    return { clause: `owner_id = $${firstParamIndex}`, params: [userId] };
  }

  return {
    clause: `(owner_id = $${firstParamIndex} OR organization_id = ANY($${firstParamIndex + 1}::uuid[]))`,
    params: [userId, organizationIds]
  };
}

/**
 * Soft delete. A question may already sit in somebody's exam or practice, and
 * removing the row underneath them would gut it.
 */
export async function deleteQuestion(ownerId: string, id: string) {
  const questionId = parseId(id);
  if (questionId === null) return null;

  const scope = await writeScope(ownerId, 2);

  const rows = (await sql(
    `UPDATE content.questions
        SET deleted_at = now()
      WHERE id = $1 AND ${scope.clause} AND deleted_at IS NULL
      RETURNING id::int AS id`,
    [questionId, ...scope.params]
  )) as unknown as { id: number }[];
  return rows[0] ?? null;
}
