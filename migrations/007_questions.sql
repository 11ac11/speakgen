-- One questions table, replacing the eleven level.part tables.
--
-- The point of collapsing them is identity: a question in b2.part1 has an id
-- that is only unique within that table, so nothing can hold a foreign key to
-- it. Exams and practices both need to. After this, a question is one row with
-- one id, and (id, level, part) is a foreign-key target that lets the database
-- refuse to put a C1 question into a B2 exam.
--
-- Created empty; 008 backfills it. The legacy schemas stay in place as the
-- rollback path until the application has cut over.

BEGIN;

CREATE TABLE content.questions (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level         text     NOT NULL,
  part          smallint NOT NULL,

  -- NULL owner means house content: the free tier's shop window. No user can
  -- edit or privatise it, so sample exams built from it cannot decay.
  owner_id      uuid REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  visibility    text NOT NULL DEFAULT 'private'
                  CHECK (visibility IN ('private', 'public')),

  statement     text NOT NULL,              -- the printed task or question
  statement_two text,                       -- C1 p2 second question; C2 p2 collaborative task
  follow_up     text,                       -- p2: the 30s question for the other candidate
  decision      text,                       -- p3: "now decide which..."
  prompts       text[]    NOT NULL DEFAULT '{}',   -- p3 mind-map ideas
  image_ids     integer[] NOT NULL DEFAULT '{}',   -- p2 Pexels ids, ordered
  instructions  text[]    NOT NULL DEFAULT '{}',   -- staged interlocutor instructions

  -- Migrated rows that are structurally incomplete against the real exam
  -- format, e.g. a B2 Part 2 with no partner follow-up question.
  needs_review  boolean NOT NULL DEFAULT false,

  legacy_level  text,                       -- keeps /question/[level]/[part]/[id] resolvable
  legacy_id     integer,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  -- Only (level, part) pairs that actually exist: rejects a C2 Part 4.
  FOREIGN KEY (level, part) REFERENCES content.level_parts (level, part),

  -- Redundant for uniqueness, but required as the target of the composite
  -- foreign keys in 009/010 that pin exams and practices to one level.
  UNIQUE (id, level, part),

  -- House content is always public; there is no such thing as a private
  -- question owned by nobody.
  CONSTRAINT questions_house_is_public
    CHECK (owner_id IS NOT NULL OR visibility = 'public'),

  -- Loose cardinality guards so the backfill cannot fail. The strict per-level
  -- rule (C1 Part 2 needs exactly three images, B2 exactly two) lives in Zod
  -- next to the blueprint, where it can produce a useful error message.
  CONSTRAINT questions_p2_images
    CHECK (part <> 2 OR cardinality(image_ids) BETWEEN 2 AND 5),
  CONSTRAINT questions_p3_prompts
    CHECK (part <> 3 OR cardinality(prompts) BETWEEN 3 AND 5)
);

CREATE TRIGGER questions_touch
  BEFORE UPDATE ON content.questions
  FOR EACH ROW EXECUTE FUNCTION content.touch_updated_at();

CREATE INDEX questions_browse_idx
  ON content.questions (level, part, visibility) WHERE deleted_at IS NULL;
CREATE INDEX questions_owner_idx
  ON content.questions (owner_id) WHERE deleted_at IS NULL;
CREATE INDEX questions_legacy_idx
  ON content.questions (legacy_level, part, legacy_id);

-- Themes ---------------------------------------------------------------------
-- Replaces the text[] column. Theme-based practices need a real foreign key,
-- and an array gives no way to rename a theme or catch a typo.

CREATE TABLE content.question_themes (
  question_id bigint NOT NULL REFERENCES content.questions (id) ON DELETE CASCADE,
  theme_slug  text   NOT NULL REFERENCES content.themes (slug) ON UPDATE CASCADE,
  PRIMARY KEY (question_id, theme_slug)
);

-- Reverse lookup: "every question tagged travel_holidays", the seed query for a
-- theme-based practice.
CREATE INDEX question_themes_theme_idx ON content.question_themes (theme_slug);

COMMIT;
