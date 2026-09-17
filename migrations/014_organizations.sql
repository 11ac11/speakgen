-- School ownership of content.
--
-- Neon Auth already provides organization, member and invitation, and its
-- organization plugin is enabled, so schools, membership and invites are not
-- reimplemented here. What is missing is the link from content to a school.
--
-- Questions and exams keep owner_id, which records who wrote them, and gain
-- organization_id, which records which school owns them. Both, not either:
-- authorship is worth keeping, and a school that paid for the content expects
-- it to stay when a teacher leaves.
--
-- ON DELETE SET NULL rather than CASCADE. Deleting a school must not delete the
-- work; the content falls back to being the author's own.

BEGIN;

ALTER TABLE content.questions
  ADD COLUMN organization_id uuid
    REFERENCES neon_auth.organization (id) ON DELETE SET NULL;

ALTER TABLE content.exams
  ADD COLUMN organization_id uuid
    REFERENCES neon_auth.organization (id) ON DELETE SET NULL;

-- "Everything my school owns", the query behind a shared bank.
CREATE INDEX questions_organization_idx
  ON content.questions (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX exams_organization_idx
  ON content.exams (organization_id);

-- Membership is read on every request that resolves a plan or a visibility, so
-- the lookup by user has to be cheap. Neon Auth ships no index for it.
CREATE INDEX IF NOT EXISTS member_user_idx
  ON neon_auth.member ("userId");

CREATE INDEX IF NOT EXISTS member_organization_idx
  ON neon_auth.member ("organizationId");

COMMIT;
