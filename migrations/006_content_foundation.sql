-- Foundation tables for the content schema. Nothing in the application reads
-- these yet, so this migration is additive and safe to land ahead of any code.
--
-- Deliberately lean: content.levels and content.level_parts exist so that
-- questions can foreign-key to a valid (level, part) pair and so C2's three-part
-- shape is data rather than a hardcoded assumption. The richer exam blueprint
-- (titles, timings, how many questions each part needs, which parts are
-- per-candidate) stays in lib/cambridgeBlueprints.ts. Duplicating it here would
-- create two sources of truth that drift.

BEGIN;

CREATE SCHEMA IF NOT EXISTS content;

-- Shared updated_at trigger, used by every mutable table from 007 onwards.
CREATE OR REPLACE FUNCTION content.touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Levels ---------------------------------------------------------------------

CREATE TABLE content.levels (
  code       text     PRIMARY KEY,
  label      text     NOT NULL,          -- "B2 First"
  minutes    smallint NOT NULL,          -- speaking test length for a pair
  enabled    boolean  NOT NULL DEFAULT true,
  sort_order smallint NOT NULL
);

INSERT INTO content.levels (code, label, minutes, enabled, sort_order) VALUES
  ('b2', 'B2 First',       14, true,  1),
  ('c1', 'C1 Advanced',    15, true,  2),
  ('c2', 'C2 Proficiency', 16, false, 3);

-- Which parts each level actually has. C2 Proficiency has three parts, not four.
CREATE TABLE content.level_parts (
  level text     NOT NULL REFERENCES content.levels (code) ON DELETE CASCADE,
  part  smallint NOT NULL CHECK (part BETWEEN 1 AND 4),
  PRIMARY KEY (level, part)
);

INSERT INTO content.level_parts (level, part) VALUES
  ('b2', 1), ('b2', 2), ('b2', 3), ('b2', 4),
  ('c1', 1), ('c1', 2), ('c1', 3), ('c1', 4),
  ('c2', 1), ('c2', 2), ('c2', 3);

-- Themes ---------------------------------------------------------------------
-- Seeded from THEME_VALUES_FOR_PILLS in constants.ts. Colours live here so that
-- adding a theme is one row rather than a row plus a deploy.

CREATE TABLE content.themes (
  slug       text     PRIMARY KEY,
  label      text     NOT NULL,
  bg_color   text     NOT NULL,
  text_color text     NOT NULL,
  enabled    boolean  NOT NULL DEFAULT true,
  sort_order smallint NOT NULL
);

INSERT INTO content.themes (slug, label, bg_color, text_color, sort_order) VALUES
  ('work_education',   'Work/education',   '#D6D6D6', '#2B2B2B',  1),
  ('where_you_live',   'Where you live',   '#c29dbb', '#3a293d',  2),
  ('learning_english', 'Learning English', '#ff9bc6', '#722856',  3),
  ('your_culture',     'Your culture',     '#cbb5a6', '#533607',  4),
  ('daily_life',       'Daily life',       '#EAEAEA', '#333333',  5),
  ('travel_holidays',  'Travel/holidays',  '#CAB8E8', '#3D2170',  6),
  ('entertainment',    'Entertainment',    '#ffd1dd', '#7b3653',  7),
  ('technology',       'Technology',       '#95c6fc', '#1E3A5F',  8),
  ('sports',           'Sports',           '#d0edff', '#1B4A73',  9),
  ('family_friends',   'Family/friends',   '#F9E79B', '#5C4600', 10),
  ('hobbies',          'Hobbies',          '#EFA3A3', '#6B1F1F', 11),
  ('the_future',       'The future',       '#F5C183', '#603800', 12),
  ('health',           'Health',           '#ff8080', '#5E1A1A', 13),
  ('environment',      'Environment',      '#B7E3A8', '#2B5A20', 14),
  ('nature',           'Nature',           '#b1f1b4', '#476228', 15),
  ('food_cooking',     'Food/cooking',     '#F5B583', '#653200', 16),
  ('shopping_fashion', 'Shopping/fashion', '#E8A5C1', '#57233F', 17),
  ('dreams_ambitions', 'Dreams/ambitions', '#BCA3E8', '#3A2170', 18);

-- User profiles --------------------------------------------------------------
-- neon_auth."user" is managed by the Neon Auth service and may be migrated out
-- from under us, so application-owned columns live here instead.

CREATE TABLE content.user_profiles (
  user_id    uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  plan       text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_since timestamptz,
  levels     text[] NOT NULL DEFAULT '{}',   -- levels this teacher teaches; a UI
                                             -- default for filtering, not a permission
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_profiles_touch
  BEFORE UPDATE ON content.user_profiles
  FOR EACH ROW EXECUTE FUNCTION content.touch_updated_at();

-- Backfill the users that already exist. New signups get a row from the
-- application on first authenticated request; a trigger on neon_auth."user"
-- would be lost if the service rebuilds that table.
INSERT INTO content.user_profiles (user_id)
SELECT id FROM neon_auth."user"
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
