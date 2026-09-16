-- Practice exams: a level and the questions used, one per part.
--
-- No status, no progress, no marking. An exam is a fixed set of questions a
-- teacher runs with a pair of students.
--
-- Level scoping is enforced by the database rather than by application code.
-- The two composite foreign keys on exam_questions make it impossible to store
-- a C1 question, or a Part 3 question, in a B2 Part 2 row.

BEGIN;

CREATE TABLE content.exams (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- NULL means a house exam: the free, logged-out shop window. A user's exam is
  -- never visible to anyone else, so there is no visibility column. By
  -- convention a house exam references only house questions, which is what stops
  -- it decaying when a user privatises something.
  owner_id   uuid REFERENCES neon_auth."user" (id) ON DELETE CASCADE,

  level      text NOT NULL REFERENCES content.levels (code),
  title      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Target of the exam_questions composite key that pins every row to this
  -- exam's level.
  UNIQUE (id, level)
);

CREATE TRIGGER exams_touch
  BEFORE UPDATE ON content.exams
  FOR EACH ROW EXECUTE FUNCTION content.touch_updated_at();

CREATE INDEX exams_owner_idx ON content.exams (owner_id);

CREATE TABLE content.exam_questions (
  exam_id     bigint   NOT NULL,
  level       text     NOT NULL,
  part        smallint NOT NULL,

  -- '-' is a question the pair share, which is every part except Part 2.
  -- A real B2 or C1 Part 2 is two tasks: candidate A gets two or three
  -- photographs and a one-minute turn, then candidate B gets different
  -- photographs and their own. Leave this at '-' for one question per part and
  -- the primary key collapses to (exam_id, part); write 'A' and 'B' rows
  -- instead to run both turns, with no schema change.
  candidate   char(1)  NOT NULL DEFAULT '-' CHECK (candidate IN ('A', 'B', '-')),

  question_id bigint   NOT NULL,

  PRIMARY KEY (exam_id, part, candidate),

  FOREIGN KEY (exam_id, level)
    REFERENCES content.exams (id, level) ON DELETE CASCADE,

  -- The whole point: a question can only go into a row whose level and part
  -- match its own. RESTRICT because an exam should not be gutted by a delete
  -- elsewhere; questions are soft-deleted anyway.
  FOREIGN KEY (question_id, level, part)
    REFERENCES content.questions (id, level, part) ON DELETE RESTRICT
);

-- "Which exams use this question?" - needed before letting anyone delete one.
CREATE INDEX exam_questions_question_idx ON content.exam_questions (question_id);

COMMIT;
