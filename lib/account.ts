import { sql } from "@/lib/db";

/**
 * Deleting a teacher's own account.
 *
 * Deleting the user row cascades to everything they own, which is right for
 * their personal content and wrong for their school's: content written inside
 * a school stays with the school when its author leaves (migration 014). It
 * cannot simply lose its owner either, because an ownerless question is by
 * definition a public house question (migration 029). So school content is
 * handed to somebody who stays — the school's owner, or a new one — before the
 * account goes.
 *
 * Nothing is deleted that billing still depends on. A live personal
 * subscription, or a live Academy subscription on a school this user is the
 * last member of, blocks deletion until it is cancelled: otherwise the payment
 * provider would go on charging for an account that no longer exists.
 *
 * planAccountDeletion() works out what would happen without changing anything,
 * so Settings can show it before the teacher confirms; deleteAccount() does it,
 * in one transaction.
 */

type SchoolPlan = {
  id: string;
  name: string;
  role: string;
  /** How many of this user's questions, exams and practices belong to it. */
  items: number;
  /** "keep": handed to `successor`; "remove": the school goes with them. */
  outcome: "keep" | "remove";
  successor: { id: string; name: string } | null;
  /** The successor becomes the owner, because this user was it. */
  promotes: boolean;
  hasLiveSubscription: boolean;
};

export type DeletionPlan = {
  /** Their own questions, exams and practices, which are deleted. */
  personal: { questions: number; exams: number; practices: number };
  schools: SchoolPlan[];
  /** Reasons deletion cannot go ahead yet. Empty means it can. */
  blockers: { code: string; message: string }[];
};

const LIVE = `('trialing', 'active', 'past_due')`;

export async function planAccountDeletion(
  userId: string
): Promise<DeletionPlan> {
  const [personal] = (await sql(
    `SELECT
       (SELECT count(*)::int FROM content.questions
         WHERE owner_id = $1 AND organization_id IS NULL AND deleted_at IS NULL) AS questions,
       (SELECT count(*)::int FROM content.exams
         WHERE owner_id = $1 AND organization_id IS NULL) AS exams,
       (SELECT count(*)::int FROM content.practices
         WHERE owner_id = $1 AND organization_id IS NULL) AS practices`,
    [userId]
  )) as unknown as DeletionPlan["personal"][];

  const memberships = (await sql(
    `SELECT o.id, o.name, m.role,
            (SELECT count(*)::int FROM content.questions q
              WHERE q.organization_id = o.id AND q.owner_id = $1 AND q.deleted_at IS NULL)
          + (SELECT count(*)::int FROM content.exams e
              WHERE e.organization_id = o.id AND e.owner_id = $1)
          + (SELECT count(*)::int FROM content.practices p
              WHERE p.organization_id = o.id AND p.owner_id = $1) AS items,
            EXISTS (SELECT 1 FROM content.subscriptions s
                     WHERE s.organization_id = o.id AND s.status IN ${LIVE})
              AS has_live_subscription
       FROM neon_auth.member m
       JOIN neon_auth.organization o ON o.id = m."organizationId"
      WHERE m."userId" = $1
      ORDER BY o.name`,
    [userId]
  )) as unknown as {
    id: string;
    name: string;
    role: string;
    items: number;
    has_live_subscription: boolean;
  }[];

  const schools: SchoolPlan[] = [];
  for (const school of memberships) {
    // Who takes over: the owner if it is not this user; otherwise the longest
    // standing admin, and failing that the longest standing member.
    const [successor] = (await sql(
      `SELECT m."userId" AS id, u.name, m.role
         FROM neon_auth.member m
         JOIN neon_auth."user" u ON u.id = m."userId"
        WHERE m."organizationId" = $1 AND m."userId" <> $2
        ORDER BY (m.role = 'owner') DESC, (m.role = 'admin') DESC, m."createdAt"
        LIMIT 1`,
      [school.id, userId]
    )) as unknown as { id: string; name: string; role: string }[];

    schools.push({
      id: school.id,
      name: school.name,
      role: school.role,
      items: school.items,
      outcome: successor ? "keep" : "remove",
      successor: successor ? { id: successor.id, name: successor.name } : null,
      promotes: Boolean(successor) && successor.role !== "owner",
      hasLiveSubscription: school.has_live_subscription
    });
  }

  const blockers: DeletionPlan["blockers"] = [];

  const [personalSub] = (await sql(
    `SELECT plan FROM content.subscriptions
      WHERE user_id = $1 AND status IN ${LIVE} LIMIT 1`,
    [userId]
  )) as unknown as { plan: string }[];
  if (personalSub) {
    blockers.push({
      code: "personal_subscription",
      message: `Cancel your ${personalSub.plan === "pro" ? "Pro" : personalSub.plan} subscription first, so you are not charged for an account that no longer exists.`
    });
  }

  for (const school of schools) {
    if (school.outcome === "remove" && school.hasLiveSubscription) {
      blockers.push({
        code: "school_subscription",
        message: `You are the last teacher at ${school.name}, which has a live Academy subscription. Cancel it first, or invite a colleague to take the school over.`
      });
    }
  }

  return {
    personal: personal ?? { questions: 0, exams: 0, practices: 0 },
    schools,
    blockers
  };
}

export class AccountDeletionBlockedError extends Error {
  constructor(readonly blockers: DeletionPlan["blockers"]) {
    super(blockers.map((b) => b.message).join(" "));
    this.name = "AccountDeletionBlockedError";
  }
}

/**
 * Deletes the account, after handing school content on.
 *
 * One transaction: the hand-over, any promotion, removing a school this user
 * was the last member of, and the account itself either all happen or none
 * do. The plan is worked out again here rather than trusted from the page, so
 * a subscription started since the teacher looked still blocks it.
 */
export async function deleteAccount(userId: string): Promise<DeletionPlan> {
  const plan = await planAccountDeletion(userId);
  if (plan.blockers.length)
    throw new AccountDeletionBlockedError(plan.blockers);

  const statements = [];

  for (const school of plan.schools) {
    if (school.outcome === "keep" && school.successor) {
      // A private question of theirs used in one of the school's exams goes
      // with the exam. Left behind, it would be deleted with the account and
      // take the exam's slot — or rather, the slot's foreign key would refuse
      // and the whole deletion would fail.
      statements.push(
        sql(
          `UPDATE content.questions q
              SET owner_id = $3, organization_id = $1
            WHERE q.owner_id = $2 AND q.organization_id IS NULL
              AND EXISTS (SELECT 1 FROM content.exam_questions eq
                            JOIN content.exams e ON e.id = eq.exam_id
                           WHERE eq.question_id = q.id
                             AND e.organization_id = $1)`,
          [school.id, userId, school.successor.id]
        )
      );
      for (const table of [
        "content.questions",
        "content.exams",
        "content.practices"
      ]) {
        statements.push(
          sql(
            `UPDATE ${table} SET owner_id = $3
              WHERE organization_id = $1 AND owner_id = $2`,
            [school.id, userId, school.successor.id]
          )
        );
      }
      if (school.promotes) {
        statements.push(
          sql(
            `UPDATE neon_auth.member SET role = 'owner'
              WHERE "organizationId" = $1 AND "userId" = $2`,
            [school.id, school.successor.id]
          )
        );
      }
    } else if (school.outcome === "remove") {
      // The last member: the school goes too. Its branding and any ended
      // subscriptions cascade; content other former teachers wrote there
      // falls back to being theirs (ON DELETE SET NULL, migration 014).
      statements.push(
        sql(`DELETE FROM neon_auth.organization WHERE id = $1`, [school.id])
      );
    }
  }

  // Personal exams first, explicitly. Their slots point at questions with ON
  // DELETE RESTRICT, and a single cascade deleting both the exam and its
  // questions would depend on which it reached first.
  statements.push(
    sql(`DELETE FROM content.exams WHERE owner_id = $1`, [userId])
  );

  // Sessions, sign-in accounts, memberships, the profile and everything still
  // owned — now only personal content — cascade from here.
  statements.push(sql(`DELETE FROM neon_auth."user" WHERE id = $1`, [userId]));

  await sql.transaction(statements);
  return plan;
}
