import { sql } from "@/lib/db";

export type UsageKind = "pdf_export" | "share_view";

/**
 * Counts one use of something, for the admin metrics page. What and when,
 * never who — see migration 030.
 *
 * Best effort: a failure to count is logged and swallowed, because a teacher's
 * PDF or a student's exam matters more than the tally of it.
 */
export async function recordUsage(
  kind: UsageKind,
  target: { level: string; examId?: number | null; practiceId?: number | null }
) {
  try {
    await sql(
      `INSERT INTO content.usage_events (kind, level, exam_id, practice_id)
       VALUES ($1, $2, $3, $4)`,
      [kind, target.level, target.examId ?? null, target.practiceId ?? null]
    );
  } catch (error) {
    console.error(`Could not record ${kind}:`, error);
  }
}
