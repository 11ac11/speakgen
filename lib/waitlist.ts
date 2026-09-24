import { sql } from "@/lib/db";

/**
 * The early-access waitlist that stands in for checkout during the free launch.
 *
 * WAITLIST_MODE is the one switch between the two versions of the site. On —
 * the default — every upgrade prompt opens the waitlist form and no price is
 * shown anywhere. Set it to "false" and the pricing page, the Settings plan
 * panel and the limit prompts go back to prices and checkout, all of which is
 * still here untouched in lib/billing. Joining earns an extra saved exam either
 * way, so switching back never takes one away.
 */
export function isWaitlistMode() {
  return process.env.WAITLIST_MODE !== "false";
}

export const WAITLIST_PLANS = ["pro", "academy"] as const;
export type WaitlistPlan = (typeof WAITLIST_PLANS)[number];

/** Which prompt opened the form. Set by the button, never by the teacher. */
export const WAITLIST_TRIGGERS = [
  "exam_limit",
  "practice_limit",
  "pdf",
  "branding",
  "seats",
  "pricing_page",
  "settings"
] as const;
export type WaitlistTrigger = (typeof WAITLIST_TRIGGERS)[number];

/** Extra saved exams for a signed-in teacher who has joined. */
export const WAITLIST_BONUS_EXAMS = 1;

export async function hasJoinedWaitlist(userId: string) {
  const rows = (await sql(
    `SELECT EXISTS (SELECT 1 FROM content.waitlist WHERE user_id = $1) AS joined`,
    [userId]
  )) as unknown as { joined: boolean }[];
  return rows[0]?.joined ?? false;
}

/** The plans this teacher is on the list for, for the prompts to say so. */
export async function getWaitlistPlans(
  userId: string
): Promise<WaitlistPlan[]> {
  const rows = (await sql(
    `SELECT DISTINCT plan FROM content.waitlist WHERE user_id = $1`,
    [userId]
  )) as unknown as { plan: WaitlistPlan }[];
  return rows.map((row) => row.plan);
}

export type WaitlistEntry = {
  userId: string | null;
  email: string;
  plan: WaitlistPlan;
  trigger: WaitlistTrigger;
  schoolName: string | null;
  teacherCount: number | null;
  note: string | null;
  newsConsent: boolean;
};

/**
 * Joins, or updates an existing entry for the same email and plan.
 *
 * The trigger and created_at are kept from the first join, because the first
 * prompt is the one that answered "what made them want it". The rest is the
 * teacher's latest word, consent included: unticking it on a second visit
 * withdraws it. A signed-in join claims a row first made by email alone.
 *
 * A signed-out join cannot touch a row a signed-in teacher owns: the email is
 * typed, not verified, so anyone could type someone else's and tick consent
 * on their behalf.
 */
export async function joinWaitlist(entry: WaitlistEntry) {
  await sql(
    `INSERT INTO content.waitlist
       (user_id, email, plan, trigger, school_name, teacher_count, note, news_consent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (lower(email), plan) DO UPDATE SET
       user_id       = COALESCE(EXCLUDED.user_id, content.waitlist.user_id),
       school_name   = COALESCE(EXCLUDED.school_name, content.waitlist.school_name),
       teacher_count = COALESCE(EXCLUDED.teacher_count, content.waitlist.teacher_count),
       note          = COALESCE(EXCLUDED.note, content.waitlist.note),
       news_consent  = EXCLUDED.news_consent,
       updated_at    = now()
     WHERE EXCLUDED.user_id IS NOT NULL OR content.waitlist.user_id IS NULL`,
    [
      entry.userId,
      entry.email,
      entry.plan,
      entry.trigger,
      entry.schoolName,
      entry.teacherCount,
      entry.note,
      entry.newsConsent
    ]
  );
}
