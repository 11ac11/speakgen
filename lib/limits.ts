import { sql } from "@/lib/db";
import { entitlementsFor, withinLimit, type Plan } from "@/lib/entitlements";
import { ensureProfile, getEffectivePlan } from "@/lib/profile";

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
  const limit = entitlementsFor(plan)[resource];

  if (limit === null) return;

  const current = await countOwned(resource, ownerId);
  if (!withinLimit(limit, current)) {
    throw new PlanLimitError(resource, limit, plan);
  }
}

/** For the UI: what the viewer has used and what they are allowed. */
export async function getUsage(ownerId: string) {
  const plan = await getEffectivePlan(ownerId);
  const entitlements = entitlementsFor(plan);

  return {
    plan,
    exams: {
      used: await countOwned("exams", ownerId),
      limit: entitlements.exams
    },
    practices: {
      used: await countOwned("practices", ownerId),
      limit: entitlements.practices
    }
  };
}
