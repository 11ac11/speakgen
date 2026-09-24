-- Usage events: the two things the product does that nothing else records —
-- an exam or practice exported as a PDF, and a share link being opened — so
-- the admin metrics page can count them.
--
-- What happened, to which exam or practice, and when. Never who: there is no
-- user column, no IP, no session, nothing that could identify a teacher, and
-- above all nothing about the students who open share links, whom the privacy
-- policy promises are not tracked. A count per link per week is all the page
-- needs.
--
-- The targets are ON DELETE SET NULL rather than CASCADE: deleting an exam
-- should not rewrite how many PDFs were exported last month.

BEGIN;

CREATE TABLE content.usage_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind        text   NOT NULL CHECK (kind IN ('pdf_export', 'share_view')),
  level       text   REFERENCES content.levels (code),
  exam_id     bigint REFERENCES content.exams (id) ON DELETE SET NULL,
  practice_id bigint REFERENCES content.practices (id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- The page asks "how many of this kind, since when", and "which exams most".
CREATE INDEX usage_events_kind_time_idx
  ON content.usage_events (kind, occurred_at);
CREATE INDEX usage_events_exam_idx
  ON content.usage_events (exam_id) WHERE exam_id IS NOT NULL;

COMMIT;
