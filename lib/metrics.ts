import { sql } from "@/lib/db";

/**
 * The numbers behind /admin, straight from the database.
 *
 * Teacher counts leave out the check suites' throwaway @example.com accounts,
 * which come and go on every test run. "Active" means a sign-in session was
 * used in the period, from Neon Auth's own session table.
 */

const REAL_USER = `u.email NOT LIKE '%@example.com'`;

export type Metrics = {
  teachers: {
    total: number;
    new7: number;
    new30: number;
    active7: number;
    active30: number;
  };
  plans: {
    proPersonal: number;
    academySchools: number;
    coveredBySchools: number;
    schools: number;
  };
  content: {
    questions: number;
    exams: number;
    practices: number;
    liveShareLinks: number;
    questions30: number;
    exams30: number;
    practices30: number;
    shareLinks30: number;
  };
  usage: {
    pdfExports7: number;
    pdfExports30: number;
    pdfExportsAll: number;
    shareViews7: number;
    shareViews30: number;
    shareViewsAll: number;
  };
  weeks: {
    week: string;
    signups: number;
    exams: number;
    shareViews: number;
    pdfExports: number;
  }[];
  topShared: { title: string; level: string; views: number }[];
  byLevel: { level: string; label: string; questions: number; exams: number }[];
};

export async function getMetrics(): Promise<Metrics> {
  const [teachers, plans, content, usage, weeks, topShared, byLevel] =
    await Promise.all([
      sql(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE u."createdAt" > now() - interval '7 days')::int AS new7,
                count(*) FILTER (WHERE u."createdAt" > now() - interval '30 days')::int AS new30,
                (SELECT count(DISTINCT s."userId")::int FROM neon_auth.session s
                   JOIN neon_auth."user" u ON u.id = s."userId"
                  WHERE ${REAL_USER} AND s."updatedAt" > now() - interval '7 days') AS active7,
                (SELECT count(DISTINCT s."userId")::int FROM neon_auth.session s
                   JOIN neon_auth."user" u ON u.id = s."userId"
                  WHERE ${REAL_USER} AND s."updatedAt" > now() - interval '30 days') AS active30
           FROM neon_auth."user" u WHERE ${REAL_USER}`,
        []
      ),
      sql(
        `SELECT
           (SELECT count(*)::int FROM content.subscriptions s
              JOIN neon_auth."user" u ON u.id = s.user_id
             WHERE ${REAL_USER} AND s.status IN ('trialing','active','past_due')) AS "proPersonal",
           (SELECT count(*)::int FROM content.subscriptions s
             WHERE s.organization_id IS NOT NULL AND s.status IN ('trialing','active','past_due')) AS "academySchools",
           (SELECT count(DISTINCT m."userId")::int FROM neon_auth.member m
              JOIN content.subscriptions s ON s.organization_id = m."organizationId"
              JOIN neon_auth."user" u ON u.id = m."userId"
             WHERE ${REAL_USER} AND s.status IN ('trialing','active','past_due')) AS "coveredBySchools",
           (SELECT count(*)::int FROM neon_auth.organization) AS schools`,
        []
      ),
      // Teachers' content only — not the house library — and not the test
      // accounts', counted the same way whether it is the total or the last
      // 30 days, so the two can be compared.
      sql(
        `WITH real_owner AS (
           SELECT id FROM neon_auth."user" u WHERE ${REAL_USER}
         )
         SELECT
           (SELECT count(*)::int FROM content.questions
             WHERE owner_id IN (SELECT id FROM real_owner) AND deleted_at IS NULL) AS questions,
           (SELECT count(*)::int FROM content.exams
             WHERE owner_id IN (SELECT id FROM real_owner)) AS exams,
           (SELECT count(*)::int FROM content.practices
             WHERE owner_id IN (SELECT id FROM real_owner)) AS practices,
           (SELECT count(*)::int FROM content.share_links
             WHERE revoked_at IS NULL AND created_by IN (SELECT id FROM real_owner)) AS "liveShareLinks",
           (SELECT count(*)::int FROM content.questions
             WHERE owner_id IN (SELECT id FROM real_owner) AND deleted_at IS NULL
               AND created_at > now() - interval '30 days') AS questions30,
           (SELECT count(*)::int FROM content.exams
             WHERE owner_id IN (SELECT id FROM real_owner)
               AND created_at > now() - interval '30 days') AS exams30,
           (SELECT count(*)::int FROM content.practices
             WHERE owner_id IN (SELECT id FROM real_owner)
               AND created_at > now() - interval '30 days') AS practices30,
           (SELECT count(*)::int FROM content.share_links
             WHERE created_by IN (SELECT id FROM real_owner)
               AND created_at > now() - interval '30 days') AS "shareLinks30"`,
        []
      ),
      sql(
        `SELECT
           count(*) FILTER (WHERE kind = 'pdf_export' AND occurred_at > now() - interval '7 days')::int AS "pdfExports7",
           count(*) FILTER (WHERE kind = 'pdf_export' AND occurred_at > now() - interval '30 days')::int AS "pdfExports30",
           count(*) FILTER (WHERE kind = 'pdf_export')::int AS "pdfExportsAll",
           count(*) FILTER (WHERE kind = 'share_view' AND occurred_at > now() - interval '7 days')::int AS "shareViews7",
           count(*) FILTER (WHERE kind = 'share_view' AND occurred_at > now() - interval '30 days')::int AS "shareViews30",
           count(*) FILTER (WHERE kind = 'share_view')::int AS "shareViewsAll"
         FROM content.usage_events`,
        []
      ),
      // The last eight weeks, Monday to Sunday, the current one included and
      // empty weeks shown as zeros rather than missing.
      sql(
        `WITH weeks AS (
           SELECT generate_series(
                    date_trunc('week', now()) - interval '7 weeks',
                    date_trunc('week', now()),
                    interval '1 week') AS week
         )
         SELECT to_char(w.week, 'YYYY-MM-DD') AS week,
                (SELECT count(*)::int FROM neon_auth."user" u
                  WHERE ${REAL_USER} AND date_trunc('week', u."createdAt") = w.week) AS signups,
                (SELECT count(*)::int FROM content.exams e
                  WHERE e.owner_id IS NOT NULL AND date_trunc('week', e.created_at) = w.week) AS exams,
                (SELECT count(*)::int FROM content.usage_events x
                  WHERE x.kind = 'share_view' AND date_trunc('week', x.occurred_at) = w.week) AS "shareViews",
                (SELECT count(*)::int FROM content.usage_events x
                  WHERE x.kind = 'pdf_export' AND date_trunc('week', x.occurred_at) = w.week) AS "pdfExports"
           FROM weeks w
          ORDER BY w.week DESC`,
        []
      ),
      sql(
        `SELECT COALESCE(e.title, p.title, '(deleted)') AS title,
                x.level, count(*)::int AS views
           FROM content.usage_events x
           LEFT JOIN content.exams e ON e.id = x.exam_id
           LEFT JOIN content.practices p ON p.id = x.practice_id
          WHERE x.kind = 'share_view' AND x.occurred_at > now() - interval '30 days'
          GROUP BY 1, 2
          ORDER BY views DESC
          LIMIT 5`,
        []
      ),
      sql(
        `SELECT l.code AS level, l.label,
                (SELECT count(*)::int FROM content.questions q
                  WHERE q.level = l.code AND q.owner_id IS NOT NULL AND q.deleted_at IS NULL) AS questions,
                (SELECT count(*)::int FROM content.exams e
                  WHERE e.level = l.code AND e.owner_id IS NOT NULL) AS exams
           FROM content.levels l
          WHERE l.enabled
          ORDER BY l.sort_order`,
        []
      )
    ]);

  return {
    teachers: (teachers as unknown as Metrics["teachers"][])[0],
    plans: (plans as unknown as Metrics["plans"][])[0],
    content: (content as unknown as Metrics["content"][])[0],
    usage: (usage as unknown as Metrics["usage"][])[0],
    weeks: weeks as unknown as Metrics["weeks"],
    topShared: topShared as unknown as Metrics["topShared"],
    byLevel: byLevel as unknown as Metrics["byLevel"]
  };
}
