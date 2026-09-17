import { sql } from "@/lib/db";
import {
  entitlementsFor,
  type Entitlements,
  type Plan
} from "@/lib/entitlements";

export type Profile = {
  user_id: string;
  plan: Plan;
  plan_since: string | null;
  levels: string[];
};

/**
 * The profile for a signed-in user, created on first sight.
 *
 * neon_auth."user" is managed by the Neon Auth service, so a trigger on it
 * would be lost if the service ever rebuilds that table. Upserting here instead
 * means a profile exists from the first authenticated request, and no code
 * downstream has to treat "no row" as a third state alongside free and paid.
 */
export async function ensureProfile(userId: string): Promise<Profile> {
  const rows = (await sql(
    `INSERT INTO content.user_profiles (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING user_id, plan, plan_since, levels`,
    [userId]
  )) as unknown as Profile[];

  return rows[0];
}

/**
 * DO UPDATE rather than DO NOTHING above is deliberate: DO NOTHING returns no
 * row on conflict, which would make the common path a second query.
 */

export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = (await sql(
    `SELECT user_id, plan, plan_since, levels
       FROM content.user_profiles WHERE user_id = $1`,
    [userId]
  )) as unknown as Profile[];

  return rows[0] ?? null;
}

/** A user's effective plan and what it allows. Falls back to free. */
export async function getEntitlements(
  userId: string | null
): Promise<Entitlements & { plan: Plan }> {
  if (!userId) return { plan: "free", ...entitlementsFor("free") };

  const profile = await ensureProfile(userId);
  return { plan: profile.plan, ...entitlementsFor(profile.plan) };
}

export async function getAiCreditBalance(userId: string): Promise<number> {
  const rows = (await sql(
    `SELECT balance FROM content.ai_credit_balances WHERE user_id = $1`,
    [userId]
  )) as unknown as { balance: number }[];

  return rows[0]?.balance ?? 0;
}

/**
 * Records a credit grant or spend. The balance is always the sum of these, so
 * there is no counter to drift out of step with the history.
 */
export async function recordAiCredits(
  userId: string,
  delta: number,
  reason: "plan_grant" | "purchase" | "generation" | "refund" | "adjustment",
  reference?: string
) {
  await sql(
    `INSERT INTO content.ai_credit_events (user_id, delta, reason, reference)
     VALUES ($1, $2, $3, $4)`,
    [userId, delta, reason, reference ?? null]
  );
}
