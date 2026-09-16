-- House content for B2 First: Parts 2, 3 and 4, plus two complete practice
-- exams. Everything here is owner_id NULL and public, so logged-out visitors
-- can run a full exam before creating an account.
--
-- Before this there were 66 Part 1 questions, one Part 2, and nothing at all
-- for Parts 3 and 4, so a B2 exam could not be filled.
--
-- Format, from the Cambridge B2 First speaking test:
--   Part 2  two photographs, a comparison question, and a 30-second follow-up
--           question the OTHER candidate answers about the same photographs.
--   Part 3  a task instruction with five written prompts for a two-minute
--           discussion, then a separate decision question for the final minute.
--   Part 4  discussion questions on the Part 3 topic, tagged to the same themes
--           so the exam builder can link them.
--
-- image_ids are real Pexels photo ids.

BEGIN;

-- Part 2 ---------------------------------------------------------------------

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('b2', 2, NULL, 'public',
    'Compare the photographs and say why the people might have chosen to study in these different ways.',
    'Which of these ways of studying would suit you better?',
    ARRAY[6281132, 35362880])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'learning_english']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('b2', 2, NULL, 'public',
    'Compare the photographs and say what the people might enjoy about travelling in these different ways.',
    'How do most people travel to work where you live?',
    ARRAY[31163913, 35623522])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['travel_holidays', 'daily_life']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('b2', 2, NULL, 'public',
    'Compare the photographs and say why the people might have chosen to eat in these different ways.',
    'Do you prefer eating at home or eating out?',
    ARRAY[5637911, 14876663])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['food_cooking', 'family_friends']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('b2', 2, NULL, 'public',
    'Compare the photographs and say how the people might be feeling about the activities they are doing.',
    'Which of these activities would you rather take part in?',
    ARRAY[8498156, 16543119])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['sports', 'health']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('b2', 2, NULL, 'public',
    'Compare the photographs and say what might be difficult about working in these different places.',
    'Would you prefer to work alone or with other people?',
    ARRAY[3981699, 7495493])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'technology']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, follow_up, image_ids)
  VALUES ('b2', 2, NULL, 'public',
    'Compare the photographs and say why the people might have chosen these different kinds of holiday.',
    'What kind of holiday do you enjoy most?',
    ARRAY[16747552, 9448808])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['travel_holidays', 'nature']) FROM q;

-- Part 3 ---------------------------------------------------------------------

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b2', 3, NULL, 'public',
    'Here are some things that can help people learn a foreign language. Talk to each other about how useful these things are for someone learning a language.',
    ARRAY['watching films and TV', 'living in another country', 'using a language app',
          'classes with a teacher', 'talking to native speakers'],
    'Now decide which of these would help a beginner the most.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['learning_english', 'work_education']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b2', 3, NULL, 'public',
    'Here are some ways people spend their free time. Talk to each other about why these activities might be enjoyable.',
    ARRAY['playing a sport', 'meeting friends', 'reading',
          'learning something new', 'spending time outdoors'],
    'Now decide which of these is the best way to relax after a busy week.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['hobbies', 'daily_life']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b2', 3, NULL, 'public',
    'Here are some changes a town could make. Talk to each other about how these changes might improve life for people living there.',
    ARRAY['more parks and green spaces', 'better public transport', 'more places for young people',
          'cheaper housing', 'pedestrian-only streets'],
    'Now decide which change would make the biggest difference.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['where_you_live', 'environment']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b2', 3, NULL, 'public',
    'Here are some things people consider when choosing a job. Talk to each other about how important these things are.',
    ARRAY['a high salary', 'working with people you like', 'a short journey to work',
          'the chance to be creative', 'job security'],
    'Now decide which is the most important for someone starting their first job.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'dreams_ambitions']) FROM q;

WITH q AS (
  INSERT INTO content.questions (level, part, owner_id, visibility, statement, prompts, decision)
  VALUES ('b2', 3, NULL, 'public',
    'Here are some ways technology has changed daily life. Talk to each other about whether these changes have been positive.',
    ARRAY['shopping online', 'working from home', 'staying in touch with family',
          'learning new skills', 'sharing photos and news'],
    'Now decide which change has had the greatest effect on people''s lives.')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['technology', 'daily_life']) FROM q;

-- Part 4 ---------------------------------------------------------------------
-- Tagged to match the Part 3 themes above, so a builder can suggest the Part 4
-- questions that belong with the chosen Part 3 topic.

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('b2', 4, NULL, 'public', 'Do you think everyone should learn a second language? Why?'),
  ('b2', 4, NULL, 'public', 'Some people say it is easier to learn a language as a child. What do you think?'),
  ('b2', 4, NULL, 'public', 'How important is it to learn about a country''s culture as well as its language?'),
  ('b2', 4, NULL, 'public', 'Do you think people have more free time now than in the past?'),
  ('b2', 4, NULL, 'public', 'Some people say hobbies are a waste of time. What would you say to them?'),
  ('b2', 4, NULL, 'public', 'How important is it for children to have hobbies outside school?'),
  ('b2', 4, NULL, 'public', 'Who should be responsible for improving a town, the government or the people who live there?'),
  ('b2', 4, NULL, 'public', 'Do you think people care more about their local area than they used to?'),
  ('b2', 4, NULL, 'public', 'What makes somewhere a good place to live?'),
  ('b2', 4, NULL, 'public', 'Do you think people change jobs more often now than in the past?'),
  ('b2', 4, NULL, 'public', 'Is it better to do a job you love or a job that pays well?'),
  ('b2', 4, NULL, 'public', 'How important is it to have a plan for your future career?'),
  ('b2', 4, NULL, 'public', 'Do you think technology brings people closer together or pushes them apart?'),
  ('b2', 4, NULL, 'public', 'Should there be limits on how much time children spend online?'),
  ('b2', 4, NULL, 'public', 'How might technology change the way we work in the future?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('Do you think everyone should learn a second language? Why?', 'learning_english'),
  ('Some people say it is easier to learn a language as a child. What do you think?', 'learning_english'),
  ('How important is it to learn about a country''s culture as well as its language?', 'learning_english'),
  ('How important is it to learn about a country''s culture as well as its language?', 'your_culture'),
  ('Do you think people have more free time now than in the past?', 'hobbies'),
  ('Do you think people have more free time now than in the past?', 'daily_life'),
  ('Some people say hobbies are a waste of time. What would you say to them?', 'hobbies'),
  ('How important is it for children to have hobbies outside school?', 'hobbies'),
  ('Who should be responsible for improving a town, the government or the people who live there?', 'where_you_live'),
  ('Do you think people care more about their local area than they used to?', 'where_you_live'),
  ('What makes somewhere a good place to live?', 'where_you_live'),
  ('What makes somewhere a good place to live?', 'environment'),
  ('Do you think people change jobs more often now than in the past?', 'work_education'),
  ('Is it better to do a job you love or a job that pays well?', 'work_education'),
  ('Is it better to do a job you love or a job that pays well?', 'dreams_ambitions'),
  ('How important is it to have a plan for your future career?', 'dreams_ambitions'),
  ('Do you think technology brings people closer together or pushes them apart?', 'technology'),
  ('Should there be limits on how much time children spend online?', 'technology'),
  ('How might technology change the way we work in the future?', 'technology'),
  ('How might technology change the way we work in the future?', 'the_future')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'b2' AND q.part = 4 AND q.owner_id IS NULL;

-- House exams ----------------------------------------------------------------
-- Two complete B2 practice exams. Part 2 uses both candidate slots, because a
-- real Part 2 is two turns: candidate A speaks about their photographs, then
-- candidate B speaks about different ones.

INSERT INTO content.exams (owner_id, level, title) VALUES
  (NULL, 'b2', 'B2 First — Practice Exam 1'),
  (NULL, 'b2', 'B2 First — Practice Exam 2');

INSERT INTO content.exam_questions (exam_id, level, part, candidate, question_id)
SELECT e.id, 'b2', t.part, t.candidate, q.id
FROM content.exams e
JOIN (VALUES
  ('B2 First — Practice Exam 1', 1::smallint, '-', 'What are your hobbies?'),
  ('B2 First — Practice Exam 1', 2, 'A', 'Compare the photographs and say why the people might have chosen to study in these different ways.'),
  ('B2 First — Practice Exam 1', 2, 'B', 'Compare the photographs and say what the people might enjoy about travelling in these different ways.'),
  ('B2 First — Practice Exam 1', 3, '-', 'Here are some things that can help people learn a foreign language. Talk to each other about how useful these things are for someone learning a language.'),
  ('B2 First — Practice Exam 1', 4, '-', 'Do you think everyone should learn a second language? Why?'),
  ('B2 First — Practice Exam 2', 1, '-', 'How would you describe the area you live in?'),
  ('B2 First — Practice Exam 2', 2, 'A', 'Compare the photographs and say why the people might have chosen to eat in these different ways.'),
  ('B2 First — Practice Exam 2', 2, 'B', 'Compare the photographs and say why the people might have chosen these different kinds of holiday.'),
  ('B2 First — Practice Exam 2', 3, '-', 'Here are some changes a town could make. Talk to each other about how these changes might improve life for people living there.'),
  ('B2 First — Practice Exam 2', 4, '-', 'What makes somewhere a good place to live?')
) AS t(title, part, candidate, statement) ON t.title = e.title
JOIN content.questions q
  ON q.statement = t.statement AND q.level = 'b2' AND q.part = t.part
 AND q.owner_id IS NULL AND q.deleted_at IS NULL
WHERE e.owner_id IS NULL;

COMMIT;
