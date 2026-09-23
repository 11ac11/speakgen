import { z } from "zod";
import { QUESTION_LEVELS } from "@/constants";
import { getCambridgeSpeakingTask } from "@/lib/cambridgeBlueprints";

export const questionPayloadSchema = z.object({
  statement: z.string().trim().min(1).max(200),
  statement_two: z.string().trim().max(500).optional(),
  // Part 2: the 30-second question the other candidate answers about the same
  // photographs. Part 3: the second-phase task, "now decide which...".
  follow_up: z.string().trim().max(500).optional(),
  decision: z.string().trim().max(500).optional(),
  themes: z.array(z.string().trim().min(1)).min(1),
  /* No `public`. A teacher's question is private, full stop; see migration
     029. An old client that still sends it has it stripped, not refused. */
  image_ids: z.array(z.number().int()).optional(),
  instructions: z.array(z.string().trim().min(1)).optional(),
  prompts: z.array(z.string().trim().min(1)).optional()
});

export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

/**
 * Mirrors the two CHECK constraints on content.questions, questions_p2_images
 * and questions_p3_prompts.
 *
 * The database is still the authority — this exists so a request that breaks
 * one comes back as a 400 naming the field, rather than as a constraint
 * violation the caller has to guess at.
 */
export function filledPrompts(prompts: unknown): string[] {
  if (!Array.isArray(prompts)) return [];
  return prompts
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim());
}

export function filledImageIds(imageIds: unknown): number[] {
  if (!Array.isArray(imageIds)) return [];
  return imageIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

/** "one photograph", "between 3 and 5 prompts" — whichever the task wants. */
function countPhrase(range: { min: number; max: number }, noun: string) {
  if (range.min === range.max) {
    return range.min === 1 ? `one ${noun}` : `${range.min} ${noun}s`;
  }
  return `between ${range.min} and ${range.max} ${noun}s`;
}

/**
 * Mirrors the two CHECK constraints on content.questions, questions_p2_images
 * and questions_p3_prompts.
 *
 * Counts what is actually filled in rather than the length of the array. Both
 * editors write to a fixed set of slots by index — Prompts does
 * `newTags[index] = value`, ImageSelectors maps empty slots to null — so
 * typing into the third prompt box of an empty form produces an array of
 * length three holding one prompt. Trusting the length would let that through.
 *
 * The counts come from the blueprint rather than from the part number. They
 * used to be written into `if (part === "2")`, which was true for B2, C1 and C2
 * and wrong the moment B1 arrived: its long turn is one photograph described,
 * not two compared, and under the old rule no B1 Part 2 question could be
 * saved at all.
 *
 * The database is still the authority. This exists so a request that breaks a
 * constraint comes back as a 400 naming the field, rather than as a violation
 * the caller has to guess at.
 */
export function checkPartShape(
  level: string,
  part: string,
  payload: { image_ids?: unknown; prompts?: unknown },
  fail: (path: "image_ids" | "prompts", message: string) => void
) {
  const task = getCambridgeSpeakingTask(level, part);
  if (!task) return;

  const label = `A ${level.toUpperCase()} Part ${part} question`;

  if (task.images) {
    const images = filledImageIds(payload.image_ids).length;
    if (images < task.images.min || images > task.images.max) {
      fail(
        "image_ids",
        `${label} needs ${countPhrase(task.images, "photograph")}`
      );
    }
  }

  if (task.prompts) {
    const prompts = filledPrompts(payload.prompts).length;
    if (prompts < task.prompts.min || prompts > task.prompts.max) {
      fail("prompts", `${label} needs ${countPhrase(task.prompts, "prompt")}`);
    }
  }
}

/**
 * Creating a question carries its level and part in the body, because the
 * collection route is /api/questions rather than a level/part path.
 */
export const questionCreateSchema = questionPayloadSchema
  .extend({
    level: z.string().trim().min(1).max(8),
    part: z.string().trim().regex(/^\d$/)
  })
  .superRefine((value, ctx) => {
    checkPartShape(value.level, value.part, value, (path, message) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })
    );
  });

/**
 * Cheap shape check so an obviously wrong URL gets a 400 rather than an empty
 * list. content.level_parts is the actual authority: the (level, part) foreign
 * key on content.questions rejects anything invalid on write, whatever this says.
 */
export function isValidLevelPart(level: string, part: string) {
  return QUESTION_LEVELS[level.toLowerCase()]?.parts.includes(part) ?? false;
}
