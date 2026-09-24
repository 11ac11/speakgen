-- The early-access waitlist, for the free launch: Pro and Academy are not on
-- sale, so every "upgrade" prompt asks teachers to join this list instead, and
-- the list is the measure of whether billing is worth turning on.
--
-- One row per email per plan. `trigger` is which prompt brought them here —
-- the exam limit, the practice limit, PDF export, branding, seats or the plans
-- page — set by the button, never typed, and kept from the first join: it is
-- the answer to "which limit makes people want to pay", and a later visit to
-- the plans page should not overwrite it.
--
-- `user_id` is set for a signed-in teacher and is what earns the extra saved
-- exam (lib/limits.ts). A visitor on the plans page can join by email alone;
-- there is no account to give the exam to. ON DELETE CASCADE, so deleting an
-- account takes its waitlist rows with it.
--
-- `news_consent` is separate from joining and never a condition of the bonus:
-- joining asks to be told when the plan opens; this is agreement to anything
-- else, and a consent paid for with an exam would not be freely given.
--
-- Also widens usage_events with the three limit hits, still counted without
-- saying who (migration 030), so the admin page can set cap hits against
-- joins.

BEGIN;

CREATE TABLE content.waitlist (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       uuid REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  email         text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  plan          text NOT NULL CHECK (plan IN ('pro', 'academy')),
  trigger       text NOT NULL CHECK (trigger IN (
                  'exam_limit', 'practice_limit', 'pdf', 'branding', 'seats',
                  'pricing_page', 'settings'
                )),
  school_name   text CHECK (length(school_name) <= 80),
  teacher_count integer CHECK (teacher_count BETWEEN 1 AND 1000),
  note          text CHECK (length(note) <= 500),
  news_consent  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_email_plan_idx
  ON content.waitlist (lower(email), plan);

-- The bonus check: "has this teacher joined anything".
CREATE INDEX waitlist_user_idx
  ON content.waitlist (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE content.usage_events
  DROP CONSTRAINT usage_events_kind_check;
ALTER TABLE content.usage_events
  ADD CONSTRAINT usage_events_kind_check CHECK (kind IN (
    'pdf_export', 'share_view', 'exam_limit', 'practice_limit', 'pdf_limit'
  ));

COMMIT;
