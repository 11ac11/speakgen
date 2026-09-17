import { sql } from "@/lib/db";
import type {
  BillingEvent,
  BillingProviderName,
  SubscriptionState,
  SubscriptionStatus
} from "@/lib/billing/types";
import type { Plan } from "@/lib/entitlements";

/**
 * Turning a provider's subscription into an effective plan.
 *
 * This is the only code that may change content.user_profiles.plan. Not the
 * client, not the checkout redirect: a customer returning from a successful
 * payment page proves nothing, since they can navigate there directly and the
 * payment can still fail afterwards. Only a verified webhook is evidence.
 */

/** Statuses that still grant access. past_due is a grace period, not a cut-off. */
const GRANTING: SubscriptionStatus[] = ["trialing", "active", "past_due"];

export function grantsAccess(status: SubscriptionStatus) {
  return GRANTING.includes(status);
}

/**
 * Records that an event was seen. Returns false if it had already been
 * recorded, which is the caller's signal to stop: providers retry, and
 * replaying a subscription change is at best pointless and at worst a second
 * credit grant.
 */
export async function claimEvent(
  provider: BillingProviderName,
  event: BillingEvent
): Promise<boolean> {
  const rows = (await sql(
    `INSERT INTO content.billing_events (provider, event_id, event_type, payload)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (provider, event_id) DO NOTHING
     RETURNING event_id`,
    [provider, event.id, event.type, JSON.stringify(event.raw ?? null)]
  )) as unknown as { event_id: string }[];

  return rows.length > 0;
}

/**
 * Gives back a claim, so a failed delivery can be retried.
 *
 * Without this, claiming before processing would turn a transient failure into
 * a permanent one: the provider retries, the event looks like a duplicate, and
 * the subscription is never applied.
 */
export async function releaseEvent(
  provider: BillingProviderName,
  eventId: string
) {
  await sql(
    `DELETE FROM content.billing_events WHERE provider = $1 AND event_id = $2`,
    [provider, eventId]
  );
}

/**
 * Writes the subscription and the plan it implies.
 *
 * One statement so the two cannot disagree: a subscription row without the plan
 * it grants is the bug that lets somebody pay and get nothing.
 *
 * The profile is upserted rather than updated. A user who signs up and goes
 * straight to checkout has never made an authenticated write, so no profile row
 * exists yet, and an UPDATE would match nothing and silently drop the plan they
 * just paid for.
 *
 * Keyed on (provider, provider_subscription_id) so events arriving out of order
 * converge on whatever the provider last told us, rather than depending on
 * which arrived first.
 */
export async function applySubscriptionState(state: SubscriptionState) {
  const effectivePlan: Plan = grantsAccess(state.status) ? state.plan : "free";

  const userId = state.subject.kind === "user" ? state.subject.userId : null;
  const organizationId =
    state.subject.kind === "organization" ? state.subject.organizationId : null;

  await sql(
    `WITH upserted AS (
       INSERT INTO content.subscriptions
         (user_id, organization_id, plan, status, billing_interval, seats,
          provider, provider_customer_id, provider_subscription_id,
          current_period_end, cancel_at_period_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (provider, provider_subscription_id) DO UPDATE SET
         plan                 = EXCLUDED.plan,
         status               = EXCLUDED.status,
         billing_interval     = EXCLUDED.billing_interval,
         seats                = EXCLUDED.seats,
         provider_customer_id = EXCLUDED.provider_customer_id,
         current_period_end   = EXCLUDED.current_period_end,
         cancel_at_period_end = EXCLUDED.cancel_at_period_end
       RETURNING user_id
     )
     INSERT INTO content.user_profiles (user_id, plan, plan_since)
     SELECT upserted.user_id, $12, now()
       FROM upserted
      WHERE upserted.user_id IS NOT NULL
     ON CONFLICT (user_id) DO UPDATE SET
       plan = EXCLUDED.plan,
       plan_since = CASE
                      WHEN content.user_profiles.plan IS DISTINCT FROM EXCLUDED.plan
                      THEN now()
                      ELSE content.user_profiles.plan_since
                    END`,
    [
      userId,
      organizationId,
      state.plan,
      state.status,
      state.interval,
      state.seats,
      state.provider,
      state.providerCustomerId,
      state.providerSubscriptionId,
      state.currentPeriodEnd,
      state.cancelAtPeriodEnd,
      effectivePlan
    ]
  );

  // An organisation subscription covers its members, which needs the member
  // table adopted first. Until the Academy tier lands, such a subscription is
  // recorded but grants nothing, and the UPDATE above matches no profile.
}

/** The live subscription for a user, if any. */
export async function getSubscriptionForUser(userId: string) {
  const rows = (await sql(
    `SELECT id::int AS id, plan, status, billing_interval, seats,
            provider, provider_customer_id, provider_subscription_id,
            current_period_end, cancel_at_period_end
       FROM content.subscriptions
      WHERE user_id = $1
        AND status IN ('trialing', 'active', 'past_due')
      LIMIT 1`,
    [userId]
  )) as unknown as Record<string, unknown>[];

  return rows[0] ?? null;
}
