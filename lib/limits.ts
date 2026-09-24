import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { entitlementsFor, withinLimit, type Plan } from "@/lib/entitlements";
import { getEffectivePlan } from "@/lib/profile";
import { recordUsage } from "@/lib/usage";
import {
  hasJoinedWaitlist,
  isWaitlistMode,
  WAITLIST_BONUS_EXAMS
} from "@/lib/waitlist";

export type LimitedResource = "exams" | "practices";

/**
 * Raised when a plan limit would be exceeded. Carries enough for the caller to
 * render a useful upgrade prompt rather than a bare refusal.
 */
export class PlanLimitError extends Error {
  constructor(
    readonly resource: LimitedResource,
    readonly limit: number,
    readonly plan: Plan
  ) {
    super(`Plan limit reached: ${limit} ${resource} on the ${plan} plan`);
    this.name = "PlanLimitError";
  }
}

async function countOwned(resource: LimitedResource, ownerId: string) {
  // The table name is chosen here rather than interpolated from the resource,
  // so the only two values it can take are the two written out.
  const table =
    resource === "practices" ? "content.practices" : "content.exams";

  const rows = (await sql(
    `SELECT count(*)::int AS n FROM ${table} WHERE owner_id = $1`,
    [ownerId]
  )) as unknown as { n: number }[];

  return rows[0]?.n ?? 0;
}

/**
 * The plan's limit, plus the extra saved exam a teacher earns by joining the
 * waitlist. Only asked about when there is a limit to raise, so paying plans
 * never pay for the lookup.
 */
async function limitFor(
  ownerId: string,
  plan: Plan,
  resource: LimitedResource
) {
  const limit = entitlementsFor(plan)[resource];
  if (limit === null || resource !== "exams") return limit;

  return (await hasJoinedWaitlist(ownerId))
    ? limit + WAITLIST_BONUS_EXAMS
    : limit;
}

/**
 * Checks a plan limit before creating something. Throws PlanLimitError, which
 * the routes turn into a 402 so the client can tell "you need to upgrade" apart
 * from "your request was wrong".
 *
 * Counting on demand rather than keeping a tally: the numbers are tiny, and a
 * counter would be one more thing to drift.
 */
export async function assertWithinPlan(
  ownerId: string,
  resource: LimitedResource
) {
  // The effective plan, so a teacher in a paying school is not held to the free
  // limits because they have no subscription of their own.
  const plan = await getEffectivePlan(ownerId);
  const limit = await limitFor(ownerId, plan, resource);

  if (limit === null) return;

  const current = await countOwned(resource, ownerId);
  if (!withinLimit(limit, current)) {
    throw new PlanLimitError(resource, limit, plan);
  }
}

/** For the UI: what the viewer has used and what they are allowed. */
export async function getUsage(ownerId: string) {
  const plan = await getEffectivePlan(ownerId);
  const [examsUsed, examLimit, practicesUsed, joinedWaitlist] =
    await Promise.all([
      countOwned("exams", ownerId),
      limitFor(ownerId, plan, "exams"),
      countOwned("practices", ownerId),
      hasJoinedWaitlist(ownerId)
    ]);

  return {
    plan,
    joinedWaitlist,
    exams: { used: examsUsed, limit: examLimit },
    practices: {
      used: practicesUsed,
      limit: entitlementsFor(plan).practices
    }
  };
}

/**
 * The 402 both create routes send for a PlanLimitError, counted on the way out.
 *
 * It says whether the waitlist is what stands in for checkout and whether this
 * teacher is on it already, so the builder can offer the form — and the extra
 * exam it earns — or say they are on the list, without asking again.
 */
export async function planLimitResponse(
  error: PlanLimitError,
  ownerId: string,
  level?: string
) {
  const [joined] = await Promise.all([
    hasJoinedWaitlist(ownerId),
    recordUsage(error.resource === "exams" ? "exam_limit" : "practice_limit", {
      level: level?.toLowerCase() ?? null
    })
  ]);

  return NextResponse.json(
    {
      error: "Plan limit reached",
      resource: error.resource,
      limit: error.limit,
      plan: error.plan,
      waitlist: { mode: isWaitlistMode(), joined }
    },
    { status: 402 }
  );
}
