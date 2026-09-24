import { sql } from "@/lib/db";

export type UsageKind =
  | "pdf_export"
  | "share_view"
  // A free teacher refused by a plan limit (migration 031), so the admin page
  // can set how often the limits bite against how many join the waitlist.
  | "exam_limit"
  | "practice_limit"
  | "pdf_limit";

/**
 * Counts one use of something, for the admin metrics page. What and when,
 * never who — see migration 030.
 *
 * Best effort: a failure to count is logged and swallowed, because a teacher's
 * PDF or a student's exam matters more than the tally of it.
 */
export async function recordUsage(
  kind: UsageKind,
  target: {
    level?: string | null;
    examId?: number | null;
    practiceId?: number | null;
  } = {}
) {
  try {
    await sql(
      `INSERT INTO content.usage_events (kind, level, exam_id, practice_id)
       VALUES ($1, $2, $3, $4)`,
      [
        kind,
        target.level ?? null,
        target.examId ?? null,
        target.practiceId ?? null
      ]
    );
  } catch (error) {
    console.error(`Could not record ${kind}:`, error);
  }
}
