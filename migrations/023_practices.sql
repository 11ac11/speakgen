-- Practices: a saved rule for drawing questions, not a saved list of them.
--
-- This is the one place a practice differs from an exam, and everything else
-- follows from it. An exam pins specific questions into specific slots, so
-- content.exam_questions exists and the composite foreign keys can pin every
-- row to the exam's level. A practice stores what to draw — the level, which
-- part if any, which themes if any, and how many — and draws a fresh set every
-- time it is run. There is no practice_items table, and deliberately so: the
-- point of a practice is repetition without repetition, the same rule giving a
-- different ten questions each Monday.
--
-- That also settles the two questions an items table would have raised, the
-- ones left open when this was first designed: a public question later made
-- private simply stops being drawn, and deleting a question cannot gut someone
-- else's practice, because nothing references it.
--
-- NULL is "no filter" in both directions, which is what makes the three flows
-- the interface offers fall out of two independent columns rather than a mode
-- enum:
--
--   part NULL, no themes    mixed — any part, any theme
--   part NULL, themes       themed — any part, one or two topics
--   part set,  no themes    one part, any theme
--   part set,  themes       both, which the interface also allows
--
-- A mode column would have been a fourth thing to keep in step with those two,
-- and would have had no value to hold for that last combination.

BEGIN;

CREATE TABLE content.practices (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- NULL means house content, the same convention as exams and questions.
  owner_id   uuid REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  -- Written inside a school, so it stays when the author leaves. Both, not
  -- either, as 014 says.
  organization_id uuid
    REFERENCES neon_auth.organization (id) ON DELETE SET NULL,

  level      text NOT NULL REFERENCES content.levels (code),
  title      text NOT NULL,

  -- NULL means every part the level has. Not zero and not -1: NULL is the only
  -- value that makes the (level, part) foreign key below skip its check, which
  -- is exactly the semantics wanted.
  part       smallint,

  -- How many to draw. The upper bound is a sanity guard, not a plan limit;
  -- what a teacher may actually ask for is capped by how many questions they
  -- can draw from, which the interface works out and the API re-checks.
  question_count smallint NOT NULL
    CHECK (question_count BETWEEN 1 AND 50),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- MATCH SIMPLE, the default: a row with part NULL satisfies this without
  -- checking anything, so "every part" needs no special case. A row with a part
  -- must name one the level actually has, which is what rejects a C2 Part 4.
  FOREIGN KEY (level, part) REFERENCES content.level_parts (level, part),

  -- The composite target, matching exams. Nothing needs it yet — practice
  -- themes are not level-scoped — but share links will hang off a practice the
  -- same way they hang off an exam, and adding it later means rewriting the
  -- table rather than the reference.
  UNIQUE (id, level)
);

CREATE TRIGGER practices_touch
  BEFORE UPDATE ON content.practices
  FOR EACH ROW EXECUTE FUNCTION content.touch_updated_at();

CREATE INDEX practices_owner_idx ON content.practices (owner_id);
CREATE INDEX practices_organization_idx ON content.practices (organization_id);
CREATE INDEX practices_level_idx ON content.practices (level);

-- Themes ---------------------------------------------------------------------
-- A table rather than a text[] column, for the reason 007 gives for question
-- themes: a real foreign key catches a typo and survives a theme being renamed.
--
-- No row means "any theme". The interface offers one or two; nothing here caps
-- it, because the draw is an OR over whatever is listed and two is a house
-- style rather than a rule worth encoding.

CREATE TABLE content.practice_themes (
  practice_id bigint NOT NULL
    REFERENCES content.practices (id) ON DELETE CASCADE,
  theme_slug  text   NOT NULL
    REFERENCES content.themes (slug) ON DELETE RESTRICT,
  PRIMARY KEY (practice_id, theme_slug)
);

CREATE INDEX practice_themes_theme_idx
  ON content.practice_themes (theme_slug);

COMMIT;
