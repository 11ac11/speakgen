-- Share links: a private URL that lets a student run one exam or one practice
-- without an account.
--
-- A link grants exactly one thing. Following it does not sign anybody in and
-- does not widen what they can read anywhere else; the share page builds a
-- viewer scoped to the one row the link names, and every other page still sees
-- an anonymous visitor. See the "share" viewer in lib/questionAccess.ts.
--
-- The token is the whole secret, so it is random rather than derived from the
-- id: 16 bytes, base64url, 22 characters. Nothing about it can be guessed from
-- the exam it points at.
--
-- Revoking sets revoked_at rather than deleting, so a teacher who revokes a
-- link and wonders why a class cannot get in can be told what happened. A new
-- link is a new token: a revoked one never comes back to life.

BEGIN;

CREATE TABLE content.share_links (
  token       text PRIMARY KEY
                CHECK (token ~ '^[A-Za-z0-9_-]{22}$'),

  -- Exactly one of these. The level travels with the link and is pinned to the
  -- target's level by the composite keys below, which is the reason 009 and
  -- 023 gave exams and practices a UNIQUE (id, level): the share page can put
  -- the level in context without trusting anything but the row.
  level       text   NOT NULL REFERENCES content.levels (code),
  exam_id     bigint,
  practice_id bigint,

  -- Who made it. SET NULL rather than CASCADE: a link to a school's exam
  -- should keep working after the teacher who made it leaves, for the same
  -- reason the exam itself does (014).
  created_by  uuid REFERENCES neon_auth."user" (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,

  CHECK (num_nonnulls(exam_id, practice_id) = 1),

  -- MATCH SIMPLE: the row whose target is the other kind has NULL here and
  -- skips the check. Deleting the exam or practice takes its links with it.
  FOREIGN KEY (exam_id, level)
    REFERENCES content.exams (id, level) ON DELETE CASCADE,
  FOREIGN KEY (practice_id, level)
    REFERENCES content.practices (id, level) ON DELETE CASCADE
);

-- One live link per target. The share panel shows "the" link, and two live
-- ones would mean revoking one leaves the class still able to get in.
CREATE UNIQUE INDEX share_links_one_live_exam
  ON content.share_links (exam_id)
  WHERE exam_id IS NOT NULL AND revoked_at IS NULL;

CREATE UNIQUE INDEX share_links_one_live_practice
  ON content.share_links (practice_id)
  WHERE practice_id IS NOT NULL AND revoked_at IS NULL;

COMMIT;
