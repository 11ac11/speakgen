-- House content for C1 Advanced, plus two complete practice exams.
--
-- C1 had no questions at all, so none of this is migrated: it is written for
-- the level. Everything is owner_id NULL and public, matching the B2 house
-- content seeded in 010.
--
-- Where C1 differs from B2 in the speaking test, and how that shows up here:
--
--   Part 2  three photographs, not two, and the candidate chooses which two to
--           compare. The prompt above them carries two questions rather than
--           one. Statements use newlines, which the Statement component renders
--           because it sets white-space: pre-line.
--   Part 3  five written prompts as at B2, but the task is more abstract and
--           the decision asks for a judgement rather than a preference.
--   Part 4  questions are abstract rather than personal, and are themed to
--           match their Part 3 topic so a builder can pair them.
--
-- Statements stay under 200 characters, the limit questionPayloadSchema
-- enforces, so everything here is editable through the normal question form.

BEGIN;

-- Part 1 ---------------------------------------------------------------------

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('c1', 1, NULL, 'public', 'How has the way you spend your free time changed over the last few years?'),
  ('c1', 1, NULL, 'public', 'What do you think you will be doing in five years'' time?'),
  ('c1', 1, NULL, 'public', 'How important is it to you to keep learning new things?'),
  ('c1', 1, NULL, 'public', 'What kind of environment do you work or study best in?'),
  ('c1', 1, NULL, 'public', 'Do you prefer to plan things carefully or leave them to chance?'),
  ('c1', 1, NULL, 'public', 'What is the most useful thing you have learned outside formal education?'),
  ('c1', 1, NULL, 'public', 'How do you usually deal with stress?'),
  ('c1', 1, NULL, 'public', 'Is there a skill you wish you had developed earlier?'),
  ('c1', 1, NULL, 'public', 'How much does the place you live influence the way you spend your time?'),
  ('c1', 1, NULL, 'public', 'What makes a conversation enjoyable for you?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('How has the way you spend your free time changed over the last few years?', 'hobbies'),
  ('How has the way you spend your free time changed over the last few years?', 'daily_life'),
  ('What do you think you will be doing in five years'' time?', 'the_future'),
  ('What do you think you will be doing in five years'' time?', 'dreams_ambitions'),
  ('How important is it to you to keep learning new things?', 'learning_english'),
  ('How important is it to you to keep learning new things?', 'work_education'),
  ('What kind of environment do you work or study best in?', 'work_education'),
  ('Do you prefer to plan things carefully or leave them to chance?', 'daily_life'),
  ('What is the most useful thing you have learned outside formal education?', 'work_education'),
  ('How do you usually deal with stress?', 'health'),
  ('How do you usually deal with stress?', 'daily_life'),
  ('Is there a skill you wish you had developed earlier?', 'dreams_ambitions'),
  ('How much does the place you live influence the way you spend your time?', 'where_you_live'),
  ('How much does the place you live influence the way you spend your time?', 'daily_life'),
  ('What makes a conversation enjoyable for you?', 'family_friends')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'c1' AND q.part = 1 AND q.owner_id IS NULL;

-- Part 2 ---------------------------------------------------------------------
-- Three photographs each; the candidate compares two of them.

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('c1', 2, NULL, 'public',
    E'Compare two of these pictures.\nWhat might be demanding about these situations?\nHow might the people be feeling?',
    'Which of these jobs would you find most stressful?',
    ARRAY[20217786, 2977515, 2760241])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'health']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('c1', 2, NULL, 'public',
    E'Compare two of these pictures.\nWhy might the people have chosen to communicate in these ways?\nHow might the audience be responding?',
    'How do you feel about speaking in front of a group?',
    ARRAY[29708262, 5905570, 8186275])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'entertainment']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('c1', 2, NULL, 'public',
    E'Compare two of these pictures.\nWhat skills might these activities require?\nWhy might people still value work done by hand?',
    'Would you like to learn a craft like one of these?',
    ARRAY[13005858, 31875677, 27893063])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['hobbies', 'work_education']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('c1', 2, NULL, 'public',
    E'Compare two of these pictures.\nHow important might attention to detail be in this work?\nWhat might the people find rewarding about it?',
    'Would you enjoy work that demands this much precision?',
    ARRAY[8533045, 9616959, 32845671])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'technology']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('c1', 2, NULL, 'public',
    E'Compare two of these pictures.\nWhy might the people have chosen to give their time in these ways?\nWhat might they gain from it?',
    'Is volunteering common where you live?',
    ARRAY[28662953, 6591154, 8543586])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['environment', 'family_friends']) FROM q;

-- Part 3 ---------------------------------------------------------------------

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('c1', 3, NULL, 'public',
    'Here are some factors that affect how successful a city is. Talk to each other about how important each one is.',
    ARRAY['affordable housing', 'cultural life', 'green spaces',
          'reliable transport', 'job opportunities'],
    'Now decide which two a growing city should prioritise.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['where_you_live', 'environment']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('c1', 3, NULL, 'public',
    'Here are some things that influence the decisions people make about their careers. Talk to each other about how strongly each one might weigh on someone.',
    ARRAY['family expectations', 'financial reward', 'personal interest',
          'opportunities to travel', 'the chance to help others'],
    'Now decide which of these influences is hardest to resist.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'dreams_ambitions']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('c1', 3, NULL, 'public',
    'Here are some ways people respond to new technology. Talk to each other about why people might react in these different ways.',
    ARRAY['adopting it immediately', 'waiting to see if it lasts',
          'worrying about privacy', 'resisting it completely',
          'using only part of it'],
    'Now decide which response is the most sensible.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['technology', 'the_future']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('c1', 3, NULL, 'public',
    'Here are some things that can make a journey memorable. Talk to each other about why each of these might stay with a traveller.',
    ARRAY['the people you meet', 'an unexpected problem', 'the landscape',
          'local food', 'travelling alone'],
    'Now decide which is most likely to change how someone sees the world.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['travel_holidays', 'your_culture']) FROM q;

-- Part 4 ---------------------------------------------------------------------

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('c1', 4, NULL, 'public', 'Do you think cities are becoming better or worse places to live?'),
  ('c1', 4, NULL, 'public', 'How far should a city''s character be protected from development?'),
  ('c1', 4, NULL, 'public', 'Whose responsibility is it to make a city worth living in?'),
  ('c1', 4, NULL, 'public', 'Do you think people are freer to choose their careers than they used to be?'),
  ('c1', 4, NULL, 'public', 'How much should someone''s work define who they are?'),
  ('c1', 4, NULL, 'public', 'Is it realistic to expect work to be fulfilling?'),
  ('c1', 4, NULL, 'public', 'Do you think societies adopt new technology too quickly?'),
  ('c1', 4, NULL, 'public', 'What might be lost as more of life moves online?'),
  ('c1', 4, NULL, 'public', 'How far should governments regulate new technology?'),
  ('c1', 4, NULL, 'public', 'Does travel genuinely broaden the mind, or is that just a comfortable idea?'),
  ('c1', 4, NULL, 'public', 'How has tourism changed the places people visit?'),
  ('c1', 4, NULL, 'public', 'Is it possible to travel responsibly?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('Do you think cities are becoming better or worse places to live?', 'where_you_live'),
  ('How far should a city''s character be protected from development?', 'where_you_live'),
  ('How far should a city''s character be protected from development?', 'environment'),
  ('Whose responsibility is it to make a city worth living in?', 'where_you_live'),
  ('Do you think people are freer to choose their careers than they used to be?', 'work_education'),
  ('How much should someone''s work define who they are?', 'work_education'),
  ('How much should someone''s work define who they are?', 'dreams_ambitions'),
  ('Is it realistic to expect work to be fulfilling?', 'work_education'),
  ('Do you think societies adopt new technology too quickly?', 'technology'),
  ('What might be lost as more of life moves online?', 'technology'),
  ('What might be lost as more of life moves online?', 'the_future'),
  ('How far should governments regulate new technology?', 'technology'),
  ('Does travel genuinely broaden the mind, or is that just a comfortable idea?', 'travel_holidays'),
  ('How has tourism changed the places people visit?', 'travel_holidays'),
  ('How has tourism changed the places people visit?', 'your_culture'),
  ('Is it possible to travel responsibly?', 'travel_holidays'),
  ('Is it possible to travel responsibly?', 'environment')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'c1' AND q.part = 4 AND q.owner_id IS NULL;

-- House exams ----------------------------------------------------------------
-- Part 4 follows its exam's Part 3 topic, as the real test does: exam 1 runs
-- cities through both, exam 2 runs careers.

INSERT INTO content.exams (owner_id, level, title) VALUES
  (NULL, 'c1', 'C1 Advanced — Practice Exam 1'),
  (NULL, 'c1', 'C1 Advanced — Practice Exam 2');

INSERT INTO content.exam_questions (exam_id, level, part, candidate, question_id)
SELECT e.id, 'c1', t.part, t.candidate, q.id
FROM content.exams e
JOIN (VALUES
  ('C1 Advanced — Practice Exam 1', 1::smallint, '-', 'How has the way you spend your free time changed over the last few years?'),
  ('C1 Advanced — Practice Exam 1', 2, 'A', E'Compare two of these pictures.\nWhat might be demanding about these situations?\nHow might the people be feeling?'),
  ('C1 Advanced — Practice Exam 1', 2, 'B', E'Compare two of these pictures.\nWhy might the people have chosen to communicate in these ways?\nHow might the audience be responding?'),
  ('C1 Advanced — Practice Exam 1', 3, '-', 'Here are some factors that affect how successful a city is. Talk to each other about how important each one is.'),
  ('C1 Advanced — Practice Exam 1', 4, '-', 'Do you think cities are becoming better or worse places to live?'),
  ('C1 Advanced — Practice Exam 2', 1, '-', 'What do you think you will be doing in five years'' time?'),
  ('C1 Advanced — Practice Exam 2', 2, 'A', E'Compare two of these pictures.\nWhat skills might these activities require?\nWhy might people still value work done by hand?'),
  ('C1 Advanced — Practice Exam 2', 2, 'B', E'Compare two of these pictures.\nHow important might attention to detail be in this work?\nWhat might the people find rewarding about it?'),
  ('C1 Advanced — Practice Exam 2', 3, '-', 'Here are some things that influence the decisions people make about their careers. Talk to each other about how strongly each one might weigh on someone.'),
  ('C1 Advanced — Practice Exam 2', 4, '-', 'Do you think people are freer to choose their careers than they used to be?')
) AS t(title, part, candidate, statement) ON t.title = e.title
JOIN content.questions q
  ON q.statement = t.statement AND q.level = 'c1' AND q.part = t.part
 AND q.owner_id IS NULL AND q.deleted_at IS NULL
WHERE e.owner_id IS NULL;

COMMIT;
