-- Plan model: what a user is entitled to, and the billing state behind it.
--
-- Two tables with two different jobs.
--
--   content.user_profiles.plan is the EFFECTIVE plan. Everything in the
--   application reads it, so it has to be cheap to read.
--
--   content.subscriptions is the provider's state: who is paying, for what,
--   until when. It is the reason a plan changes, and the billing webhook is
--   the only thing that should ever write either of them.
--
-- Nothing enforces limits yet. That is the next stage, and it lands before
-- payments exist so the limits can be tested while everyone is still free.

BEGIN;

-- Plans ----------------------------------------------------------------------

ALTER TABLE content.user_profiles DROP CONSTRAINT user_profiles_plan_check;
ALTER TABLE content.user_profiles ADD CONSTRAINT user_profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'academy'));

-- Subscriptions --------------------------------------------------------------
-- A subscription belongs to a user or to an organisation, never both. The
-- organisation column is here from the start so that the Academy tier does not
-- need a migration to become billable; neon_auth already ships the
-- organization, member and invitation tables and they are currently unused.

CREATE TABLE content.subscriptions (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  user_id         uuid REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  organization_id uuid REFERENCES neon_auth.organization (id) ON DELETE CASCADE,

  plan            text NOT NULL CHECK (plan IN ('pro', 'academy')),
  status          text NOT NULL
                    CHECK (status IN ('trialing', 'active', 'past_due',
                                      'canceled', 'incomplete')),
  billing_interval text NOT NULL CHECK (billing_interval IN ('month', 'year')),
  seats           smallint NOT NULL DEFAULT 1 CHECK (seats > 0),

  provider                 text NOT NULL
                             CHECK (provider IN ('stripe', 'paddle', 'lemonsqueezy')),
  provider_customer_id     text,
  provider_subscription_id text,

  current_period_end   timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_one_subject
    CHECK ((user_id IS NULL) <> (organization_id IS NULL)),

  -- Webhooks retry and arrive out of order, so upserts key on this.
  CONSTRAINT subscriptions_provider_ref UNIQUE (provider, provider_subscription_id)
);

CREATE TRIGGER subscriptions_touch
  BEFORE UPDATE ON content.subscriptions
  FOR EACH ROW EXECUTE FUNCTION content.touch_updated_at();

-- A subject can hold only one subscription that is actually granting access.
-- Cancelled and expired rows are kept for history.
CREATE UNIQUE INDEX subscriptions_one_live_per_user
  ON content.subscriptions (user_id)
  WHERE user_id IS NOT NULL AND status IN ('trialing', 'active', 'past_due');

CREATE UNIQUE INDEX subscriptions_one_live_per_org
  ON content.subscriptions (organization_id)
  WHERE organization_id IS NOT NULL AND status IN ('trialing', 'active', 'past_due');

-- AI credits -----------------------------------------------------------------
-- A ledger rather than a counter. The balance is the sum of the events, which
-- cannot drift, and it can answer "why is my balance 40" the first time
-- somebody asks. Credits are read only when generating, so summing on read is
-- cheap enough; a materialised balance can be added later if that changes.

CREATE TABLE content.ai_credit_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES neon_auth."user" (id) ON DELETE CASCADE,

  -- Positive grants, negative spends.
  delta      integer NOT NULL CHECK (delta <> 0),
  reason     text NOT NULL
               CHECK (reason IN ('plan_grant', 'purchase', 'generation',
                                 'refund', 'adjustment')),

  -- Whatever caused it: a generation id, a payment id, an admin note.
  reference  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_credit_events_user_idx
  ON content.ai_credit_events (user_id, created_at DESC);

CREATE VIEW content.ai_credit_balances AS
  SELECT user_id, COALESCE(sum(delta), 0)::int AS balance
    FROM content.ai_credit_events
   GROUP BY user_id;

-- Backfill -------------------------------------------------------------------
-- Migration 006 created profiles for the users that existed then, and nothing
-- has created one since. The application now upserts on first authenticated
-- request; this catches everyone who signed up in between.

INSERT INTO content.user_profiles (user_id)
SELECT id FROM neon_auth."user"
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
