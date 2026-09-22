-- House content for B1 Preliminary, plus two complete practice exams.
--
-- Everything is owner_id NULL and public, matching 010, 011 and 020.
--
-- One schema change comes first, and it is the only one B1 needs.
--
-- questions_p2_images has required two to five photographs on every Part 2 row
-- since 007, which was right while every level's Part 2 compared photographs.
-- B1's does not: each candidate is handed a single colour photograph and talks
-- about it on their own. So the floor drops to one.
--
-- Deliberately loosened rather than made level-aware. A CHECK that named 'b1'
-- would put the per-level counts in two places — here and in the blueprint —
-- and 006 is explicit that the richer shape belongs in
-- lib/cambridgeBlueprints.ts precisely so the two cannot drift. The constraint
-- keeps doing what a constraint is good at, which is catching nonsense: no
-- photographs at all, or fifty. The real counts, one for B1 and two to five for
-- the rest, are enforced by checkPartShape on the way in, which reads them from
-- the blueprint.
--
-- The content itself is pitched at B1: concrete, everyday and answerable
-- without an argument. Part 1 asks about routines and preferences rather than
-- opinions on society, Part 3 decides between things a family might actually
-- do on a Saturday, and Part 4 broadens that without abstracting it.
--
-- The photographs are ids already used by B2 and C1 house questions. They are
-- known-good and cost no Pexels call to find, which matters while that key is
-- rate limited. B1's Part 2 needs a scene with people doing something
-- describable, which is exactly what those already are.

BEGIN;

ALTER TABLE content.questions
  DROP CONSTRAINT questions_p2_images;

ALTER TABLE content.questions
  ADD CONSTRAINT questions_p2_images
  CHECK (part <> 2 OR cardinality(image_ids) BETWEEN 1 AND 5);

-- Part 1 ---------------------------------------------------------------------
-- The interview: yourself, your routines, what you like.

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('b1', 1, NULL, 'public', 'What do you usually do at the weekend?'),
  ('b1', 1, NULL, 'public', 'Tell me about the town or city where you live.'),
  ('b1', 1, NULL, 'public', 'What kind of food do you like to eat?'),
  ('b1', 1, NULL, 'public', 'Do you prefer mornings or evenings? Why?'),
  ('b1', 1, NULL, 'public', 'Tell me about a sport or a game you enjoy.'),
  ('b1', 1, NULL, 'public', 'How do you usually travel to work or school?'),
  ('b1', 1, NULL, 'public', 'What did you do on your last holiday?'),
  ('b1', 1, NULL, 'public', 'Tell me about someone in your family.'),
  ('b1', 1, NULL, 'public', 'What do you like doing when the weather is bad?'),
  ('b1', 1, NULL, 'public', 'How long have you been learning English?'),
  ('b1', 1, NULL, 'public', 'What kind of music do you listen to?'),
  ('b1', 1, NULL, 'public', 'Tell me about something you would like to learn.');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('What do you usually do at the weekend?', 'daily_life'),
  ('What do you usually do at the weekend?', 'hobbies'),
  ('Tell me about the town or city where you live.', 'where_you_live'),
  ('What kind of food do you like to eat?', 'food_cooking'),
  ('Do you prefer mornings or evenings? Why?', 'daily_life'),
  ('Tell me about a sport or a game you enjoy.', 'sports'),
  ('How do you usually travel to work or school?', 'daily_life'),
  ('What did you do on your last holiday?', 'travel_holidays'),
  ('Tell me about someone in your family.', 'family_friends'),
  ('What do you like doing when the weather is bad?', 'hobbies'),
  ('How long have you been learning English?', 'learning_english'),
  ('What kind of music do you listen to?', 'entertainment'),
  ('Tell me about something you would like to learn.', 'dreams_ambitions')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'b1' AND q.part = 1 AND q.owner_id IS NULL;

-- Part 2 ---------------------------------------------------------------------
-- One photograph each, described alone for about a minute. The statement names
-- what the photograph shows, the way the examiner does before handing it over,
-- so a teacher reading it aloud has the whole instruction.
--
-- No follow_up: the other candidate is not asked about this photograph, they
-- are given their own. That is the B slot of the pair, not a second phase.

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, image_ids)
  VALUES ('b1', 2, NULL, 'public',
    'Your photograph shows people studying. Tell me what you can see.',
    ARRAY[6281132])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'learning_english']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, image_ids)
  VALUES ('b1', 2, NULL, 'public',
    'Your photograph shows people working together. Tell me what you can see.',
    ARRAY[35362880])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, image_ids)
  VALUES ('b1', 2, NULL, 'public',
    'Your photograph shows people outdoors. Tell me what you can see.',
    ARRAY[29817318])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['nature', 'hobbies']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, image_ids)
  VALUES ('b1', 2, NULL, 'public',
    'Your photograph shows a busy place in a city. Tell me what you can see.',
    ARRAY[30426343])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['where_you_live']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, image_ids)
  VALUES ('b1', 2, NULL, 'public',
    'Your photograph shows people eating together. Tell me what you can see.',
    ARRAY[7244576])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['food_cooking', 'family_friends']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, image_ids)
  VALUES ('b1', 2, NULL, 'public',
    'Your photograph shows people travelling. Tell me what you can see.',
    ARRAY[33816597])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['travel_holidays']) FROM q;

-- Part 3 ---------------------------------------------------------------------
-- The collaborative task: a situation, some options, then a decision. The real
-- test prints the options as small drawings; these are the words for them.

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b1', 3, NULL, 'public',
    'A family wants to spend a day out together. Talk about these ideas and say what is good about each one.',
    ARRAY['go to the beach', 'visit a museum', 'have a picnic', 'go to the cinema'],
    'Now decide which one would be best for the whole family.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['family_friends', 'hobbies']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b1', 3, NULL, 'public',
    'A friend is moving to a new flat. Talk about what would help them most on the first day.',
    ARRAY['help with boxes', 'cook a meal', 'lend some furniture', 'buy some plants'],
    'Now decide which two would help them the most.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['where_you_live', 'family_friends']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b1', 3, NULL, 'public',
    'A school wants students to be healthier. Talk about these ideas and say what is good about each one.',
    ARRAY['a walking club', 'better school meals', 'longer breaks', 'free water bottles'],
    'Now decide which idea the school should try first.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['health', 'work_education']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b1', 3, NULL, 'public',
    'Some friends want to spend a weekend away together. Talk about where they could go.',
    ARRAY['a city', 'the mountains', 'a small village', 'the coast'],
    'Now decide which place they should choose.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['travel_holidays', 'family_friends']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b1', 3, NULL, 'public',
    'A student has some free time after school. Talk about what they could do with it.',
    ARRAY['learn an instrument', 'get a part-time job', 'join a sports team', 'study more'],
    'Now decide which would be best for them.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['hobbies', 'dreams_ambitions']) FROM q;

-- Part 4 ---------------------------------------------------------------------
-- The same ground as Part 3, opened out. Likes, habits and opinions.

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('b1', 4, NULL, 'public', 'Do you prefer spending time indoors or outdoors?'),
  ('b1', 4, NULL, 'public', 'Is it better to plan a day out or decide on the day?'),
  ('b1', 4, NULL, 'public', 'How often do you spend a whole day with your family?'),
  ('b1', 4, NULL, 'public', 'What makes somewhere a good place for a holiday?'),
  ('b1', 4, NULL, 'public', 'Do people in your country eat together as much as they used to?'),
  ('b1', 4, NULL, 'public', 'Is it easy to stay healthy where you live?'),
  ('b1', 4, NULL, 'public', 'What is the best way to spend your free time after work or school?'),
  ('b1', 4, NULL, 'public', 'Do you like trying new things, or doing what you already know?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('Do you prefer spending time indoors or outdoors?', 'hobbies'),
  ('Is it better to plan a day out or decide on the day?', 'daily_life'),
  ('How often do you spend a whole day with your family?', 'family_friends'),
  ('What makes somewhere a good place for a holiday?', 'travel_holidays'),
  ('Do people in your country eat together as much as they used to?', 'food_cooking'),
  ('Do people in your country eat together as much as they used to?', 'your_culture'),
  ('Is it easy to stay healthy where you live?', 'health'),
  ('What is the best way to spend your free time after work or school?', 'hobbies'),
  ('Do you like trying new things, or doing what you already know?', 'daily_life')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'b1' AND q.part = 4 AND q.owner_id IS NULL;

-- House exams ----------------------------------------------------------------
-- Five slots: Part 1, Part 2 twice — one photograph per candidate — then Part 3
-- and Part 4. Each exam runs one subject through Parts 3 and 4, as the real
-- test does: exam 1 is a day out, exam 2 is time and how you spend it.

INSERT INTO content.exams (owner_id, level, title) VALUES
  (NULL, 'b1', 'B1 Preliminary — Practice Exam 1'),
  (NULL, 'b1', 'B1 Preliminary — Practice Exam 2');

INSERT INTO content.exam_questions (exam_id, level, part, candidate, question_id)
SELECT e.id, 'b1', t.part, t.candidate, q.id
FROM content.exams e
JOIN (VALUES
  ('B1 Preliminary — Practice Exam 1', 1::smallint, '-',
   'What do you usually do at the weekend?'),
  ('B1 Preliminary — Practice Exam 1', 2, 'A',
   'Your photograph shows people eating together. Tell me what you can see.'),
  ('B1 Preliminary — Practice Exam 1', 2, 'B',
   'Your photograph shows people outdoors. Tell me what you can see.'),
  ('B1 Preliminary — Practice Exam 1', 3, '-',
   'A family wants to spend a day out together. Talk about these ideas and say what is good about each one.'),
  ('B1 Preliminary — Practice Exam 1', 4, '-',
   'Do you prefer spending time indoors or outdoors?'),
  ('B1 Preliminary — Practice Exam 2', 1, '-',
   'What do you like doing when the weather is bad?'),
  ('B1 Preliminary — Practice Exam 2', 2, 'A',
   'Your photograph shows people studying. Tell me what you can see.'),
  ('B1 Preliminary — Practice Exam 2', 2, 'B',
   'Your photograph shows people working together. Tell me what you can see.'),
  ('B1 Preliminary — Practice Exam 2', 3, '-',
   'A student has some free time after school. Talk about what they could do with it.'),
  ('B1 Preliminary — Practice Exam 2', 4, '-',
   'What is the best way to spend your free time after work or school?')
) AS t(title, part, candidate, statement) ON t.title = e.title
JOIN content.questions q
  ON q.statement = t.statement
 AND q.level = 'b1'
 AND q.part = t.part
 AND q.owner_id IS NULL
WHERE e.owner_id IS NULL AND e.level = 'b1';

COMMIT;
