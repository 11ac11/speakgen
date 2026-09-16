import { z } from "zod";
import { getQuestionTable, QUESTION_LEVELS } from "@/constants";

export const questionPayloadSchema = z.object({
  statement: z.string().trim().min(1).max(200),
  statement_two: z.string().trim().max(500).optional(),
  themes: z.array(z.string().trim().min(1)).min(1),
  public: z.boolean(),
  image_ids: z.array(z.number().int()).optional(),
  instructions: z.array(z.string().trim().min(1)).optional(),
  prompts: z.array(z.string().trim().min(1)).optional()
});

export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

export function getValidatedQuestionTable(level: string, part: string) {
  const normalizedLevel = level.toLowerCase();
  const table = getQuestionTable(normalizedLevel, part);

  if (!table || !QUESTION_LEVELS[normalizedLevel]) {
    return undefined;
  }

  return table;
}

export function getQuestionColumns(level: string, part: string) {
  const columns = ["statement", "themes", "owner_id", "public"];

  if (part === "2" && level === "c1") {
    columns.push("image_one", "image_two");
  } else if (part === "2") {
    columns.push("image_ids");
  }

  if (part === "3") {
    columns.push("prompts");
  }

  if (level === "c2" && part === "2") {
    columns.push("statement_two");
  }

  return columns;
}
