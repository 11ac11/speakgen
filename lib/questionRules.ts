import { z } from "zod";
import { QUESTION_LEVELS } from "@/constants";

export const questionPayloadSchema = z.object({
  statement: z.string().trim().min(1).max(200),
  statement_two: z.string().trim().max(500).optional(),
  // Part 2: the 30-second question the other candidate answers about the same
  // photographs. Part 3: the second-phase task, "now decide which...".
  follow_up: z.string().trim().max(500).optional(),
  decision: z.string().trim().max(500).optional(),
  themes: z.array(z.string().trim().min(1)).min(1),
  public: z.boolean(),
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
export function checkPartShape(
  part: string,
  payload: {
    image_ids?: number[];
    prompts?: string[];
  },
  fail: (path: "image_ids" | "prompts", message: string) => void
) {
  if (part === "2") {
    const images = payload.image_ids?.length ?? 0;
    if (images < 2 || images > 5) {
      fail("image_ids", "A Part 2 question needs between 2 and 5 photographs");
    }
  }

  if (part === "3") {
    const prompts = payload.prompts?.length ?? 0;
    if (prompts < 3 || prompts > 5) {
      fail("prompts", "A Part 3 question needs between 3 and 5 prompts");
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
    checkPartShape(value.part, value, (path, message) =>
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
