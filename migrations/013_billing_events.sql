-- Webhook idempotency.
--
-- Every billing provider retries, and none of them guarantee order or
-- exactly-once delivery. Recording the event id before acting means a retry is
-- a no-op rather than a second subscription or a double credit grant.
--
-- Provider-agnostic on purpose: the choice between Stripe and a merchant of
-- record is still open, and nothing here depends on it.

BEGIN;

CREATE TABLE content.billing_events (
  provider    text NOT NULL,
  event_id    text NOT NULL,
  event_type  text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),

  -- Kept for support and replay. Providers send more than we model, and the
  -- first awkward billing question is always "what did they actually send".
  payload     jsonb,

  PRIMARY KEY (provider, event_id)
);

CREATE INDEX billing_events_received_idx
  ON content.billing_events (received_at DESC);

COMMIT;
