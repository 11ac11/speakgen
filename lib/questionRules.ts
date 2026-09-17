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
 * Creating a question carries its level and part in the body, because the
 * collection route is /api/questions rather than a level/part path.
 */
export const questionCreateSchema = questionPayloadSchema.extend({
  level: z.string().trim().min(1).max(8),
  part: z.string().trim().regex(/^\d$/)
});

/**
 * Cheap shape check so an obviously wrong URL gets a 400 rather than an empty
 * list. content.level_parts is the actual authority: the (level, part) foreign
 * key on content.questions rejects anything invalid on write, whatever this says.
 */
export function isValidLevelPart(level: string, part: string) {
  return QUESTION_LEVELS[level.toLowerCase()]?.parts.includes(part) ?? false;
}
