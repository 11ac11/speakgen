-- House content for C2 Proficiency, plus two complete practice exams.
--
-- 016 deleted the one legacy C2 row as unreachable, so there is nothing to
-- migrate: this is written for the level. Everything is owner_id NULL and
-- public, matching the B2 house content in 010 and the C1 house content in 011.
--
-- C2 is not B2 or C1 with harder words. The shape of the test differs, and that
-- is what decides which columns carry what:
--
--   Part 2  is the collaborative task and it is where the photographs are, so
--           it is both a visual part and a decision part. It runs in two
--           phases over one set of four: the pair talk about two of them for
--           about a minute, then use all four for a three-minute decision task.
--           `instructions` carries the line the interlocutor reads before each
--           phase, `statement` the first-phase question and `statement_two` the
--           second-phase task. The runner reveals the second behind a button.
--           Four photographs, not two or three: the real test uses between four
--           and seven, and four is the most the question form draws at this
--           level, so a teacher editing one of these sees every image it has.
--   Part 3  is the long turn, and it is the part that runs twice — each
--           candidate gets their own card, which is why the exams below fill
--           Part 3 A and Part 3 B rather than Part 2. `statement` is the
--           question printed on the card and `prompts` the three ideas under
--           it. `follow_up` is the question the other candidate answers for
--           about a minute once the two-minute turn is over.
--
--           The discussion that closes Part 3 belongs to neither card: it is
--           examiner-led and broadens from both. It rides on `decision`, which
--           the runner prints as an interlocutor note headed "once both
--           candidates have spoken". Both cards in an exam therefore carry
--           discussion questions, and the teacher uses whichever is in front of
--           them. Giving it a slot of its own would be cleaner, but a Part 3
--           row with no prompts breaks questions_p3_prompts, and 016 left C2
--           switchable without new schema. Keeping that promise is worth more
--           than the tidier model.
--
-- Statements stay under 200 characters and prompts under 30, the limits
-- questionPayloadSchema and the prompt inputs enforce, so everything here is
-- editable through the normal question form.

BEGIN;

-- Part 1 ---------------------------------------------------------------------

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('c2', 1, NULL, 'public', 'What kind of situations bring out the best in you?'),
  ('c2', 1, NULL, 'public', 'Is there something you have changed your mind about in recent years?'),
  ('c2', 1, NULL, 'public', 'How do you decide whether a piece of advice is worth taking?'),
  ('c2', 1, NULL, 'public', 'What do you think people tend to misunderstand about the work you do?'),
  ('c2', 1, NULL, 'public', 'How much does where you grew up still show in the way you live?'),
  ('c2', 1, NULL, 'public', 'Is there a skill you keep meaning to develop but never quite do?'),
  ('c2', 1, NULL, 'public', 'How comfortable are you with being the person who makes the decision?'),
  ('c2', 1, NULL, 'public', 'What does a well-spent weekend look like to you?'),
  ('c2', 1, NULL, 'public', 'Has anything you once found difficult become second nature?'),
  ('c2', 1, NULL, 'public', 'What kind of news do you make a point of following, and why that?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('What kind of situations bring out the best in you?', 'daily_life'),
  ('What kind of situations bring out the best in you?', 'work_education'),
  ('Is there something you have changed your mind about in recent years?', 'daily_life'),
  ('How do you decide whether a piece of advice is worth taking?', 'family_friends'),
  ('What do you think people tend to misunderstand about the work you do?', 'work_education'),
  ('How much does where you grew up still show in the way you live?', 'where_you_live'),
  ('How much does where you grew up still show in the way you live?', 'your_culture'),
  ('Is there a skill you keep meaning to develop but never quite do?', 'dreams_ambitions'),
  ('How comfortable are you with being the person who makes the decision?', 'work_education'),
  ('What does a well-spent weekend look like to you?', 'hobbies'),
  ('What does a well-spent weekend look like to you?', 'daily_life'),
  ('Has anything you once found difficult become second nature?', 'learning_english'),
  ('What kind of news do you make a point of following, and why that?', 'technology'),
  ('What kind of news do you make a point of following, and why that?', 'daily_life')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'c2' AND q.part = 1 AND q.owner_id IS NULL;

-- Part 2 ---------------------------------------------------------------------
-- Four photographs each, two phases, one decision.

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, statement_two, instructions, image_ids)
  VALUES ('c2', 2, NULL, 'public',
    'Why might people choose to spend time in places like these, and what might they find there that they cannot find elsewhere?',
    'Now I''d like you to imagine that a city council is deciding where to invest in public space. These photographs show some of the places being considered. Talk together about what each place offers the people who use it. Then decide which two would do most for a city.',
    ARRAY['Look at photographs one and two.', 'Now look at all the photographs.'],
    ARRAY[30426343, 7244576, 29817318, 33816597])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['where_you_live', 'daily_life']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, statement_two, instructions, image_ids)
  VALUES ('c2', 2, NULL, 'public',
    'What might be most demanding about these kinds of work, and how much of each could be done without a person?',
    'Now I''d like you to imagine that a documentary is being made about work in fifty years'' time. These photographs show some of the occupations being considered. Talk together about how each of these jobs might change. Then decide which is least likely to be done by a machine.',
    ARRAY['Look at photographs one and two.', 'Now look at all the photographs.'],
    ARRAY[19233057, 6803542, 11798034, 6129685])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'technology']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, statement_two, instructions, image_ids)
  VALUES ('c2', 2, NULL, 'public',
    'What might make these ways of learning effective, and what might each of them ask of the learner?',
    'Now I''d like you to imagine that an education charity is choosing one approach to fund in a region with very few schools. These photographs show the approaches being considered. Talk together about who each one would reach. Then decide which would make the most lasting difference.',
    ARRAY['Look at photographs one and two.', 'Now look at all the photographs.'],
    ARRAY[8197558, 6768023, 7484149, 1741230])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['learning_english', 'work_education']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, statement_two, instructions, image_ids)
  VALUES ('c2', 2, NULL, 'public',
    'What might these pictures suggest about the way people get their food, and what might be gained or lost in each case?',
    'Now I''d like you to imagine that a magazine is running a feature on how eating habits have changed. These photographs show some of the themes being considered. Talk together about what each one says about the way people live now. Then decide which theme would interest readers most.',
    ARRAY['Look at photographs one and two.', 'Now look at all the photographs.'],
    ARRAY[33554298, 2469096, 3807337, 27037548])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['food_cooking', 'environment']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, statement_two, instructions, image_ids)
  VALUES ('c2', 2, NULL, 'public',
    'Why might occasions like these matter to the people taking part, and what might they mean to those only watching?',
    'Now I''d like you to imagine that a museum is putting together an exhibition on how people celebrate. These photographs show some of the occasions being considered. Talk together about what each one reveals about a community. Then decide which two belong in the exhibition.',
    ARRAY['Look at photographs one and two.', 'Now look at all the photographs.'],
    ARRAY[38722971, 5591173, 5193526, 9480473])
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['your_culture', 'entertainment']) FROM q;

-- Part 3 ---------------------------------------------------------------------
-- Long-turn cards: a question, three ideas, the other candidate's question,
-- and the discussion that closes the part once both have spoken.

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, follow_up, decision)
  VALUES ('c2', 3, NULL, 'public',
    'How far can technology be trusted to make decisions that affect people?',
    ARRAY['medicine', 'the law', 'employment'],
    'Do you think people are too quick to trust a decision that comes from a machine?',
    'Who should be held responsible when an automated decision turns out to be wrong? Is there any area of life where human judgement should never be replaced?')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['technology', 'the_future']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, follow_up, decision)
  VALUES ('c2', 3, NULL, 'public',
    'How far should the work someone does define who they are?',
    ARRAY['status', 'satisfaction', 'time with family'],
    'Would you want to be known mainly for the work you do?',
    'Do you think attitudes to work are changing where you live? Can a society function if people stop seeing work as central to a life?')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['work_education', 'dreams_ambitions']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, follow_up, decision)
  VALUES ('c2', 3, NULL, 'public',
    'To what extent should a society accept disruption in order to make progress?',
    ARRAY['working lives', 'the environment', 'tradition'],
    'Is there something your own country has changed too quickly?',
    'Do people judge progress differently once they have lived through its costs? Whose job is it to decide what a society gives up?')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['the_future', 'environment']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, follow_up, decision)
  VALUES ('c2', 3, NULL, 'public',
    'Why do people so often prefer a confident opinion to an expert one?',
    ARRAY['the media', 'education', 'trust in institutions'],
    'Where do you turn when you want to know whether something is true?',
    'Has it become harder for people to agree on basic facts? What might restore public trust in expertise?')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['technology', 'your_culture']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, follow_up, decision)
  VALUES ('c2', 3, NULL, 'public',
    'What makes a city somewhere people want to stay rather than leave?',
    ARRAY['affordable housing', 'a sense of belonging', 'opportunity'],
    'What would make you leave the place you live now?',
    'Are cities becoming more alike? Should a city protect its character even when that slows its growth?')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['where_you_live', 'environment']) FROM q;

WITH q AS (
  INSERT INTO content.questions
    (level, part, owner_id, visibility, statement, prompts, follow_up, decision)
  VALUES ('c2', 3, NULL, 'public',
    'How much should a society be expected to preserve of its past?',
    ARRAY['buildings', 'language', 'ways of working'],
    'Is there something from the past your own country should have kept?',
    'Who decides what is worth preserving? Can holding on to the past ever hold a society back?')
  RETURNING id
)
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, unnest(ARRAY['your_culture', 'the_future']) FROM q;

-- House exams ----------------------------------------------------------------
-- Four slots, not five: C2 has three parts, and the part that runs twice is
-- Part 3, so each exam needs one Part 1, one Part 2 and two Part 3 cards.
--
-- The two cards in an exam are different topics, as they are in the real test,
-- but they sit close enough together that the closing discussion can broaden
-- from either: exam 1 runs work and automation through all three parts, exam 2
-- runs culture and place.

INSERT INTO content.exams (owner_id, level, title) VALUES
  (NULL, 'c2', 'C2 Proficiency — Practice Exam 1'),
  (NULL, 'c2', 'C2 Proficiency — Practice Exam 2');

INSERT INTO content.exam_questions (exam_id, level, part, candidate, question_id)
SELECT e.id, 'c2', t.part, t.candidate, q.id
FROM content.exams e
JOIN (VALUES
  ('C2 Proficiency — Practice Exam 1', 1::smallint, '-',
   'What do you think people tend to misunderstand about the work you do?'),
  ('C2 Proficiency — Practice Exam 1', 2, '-',
   'What might be most demanding about these kinds of work, and how much of each could be done without a person?'),
  ('C2 Proficiency — Practice Exam 1', 3, 'A',
   'How far can technology be trusted to make decisions that affect people?'),
  ('C2 Proficiency — Practice Exam 1', 3, 'B',
   'How far should the work someone does define who they are?'),
  ('C2 Proficiency — Practice Exam 2', 1, '-',
   'How much does where you grew up still show in the way you live?'),
  ('C2 Proficiency — Practice Exam 2', 2, '-',
   'Why might occasions like these matter to the people taking part, and what might they mean to those only watching?'),
  ('C2 Proficiency — Practice Exam 2', 3, 'A',
   'How much should a society be expected to preserve of its past?'),
  ('C2 Proficiency — Practice Exam 2', 3, 'B',
   'What makes a city somewhere people want to stay rather than leave?')
) AS t(title, part, candidate, statement) ON t.title = e.title
JOIN content.questions q
  ON q.statement = t.statement
 AND q.level = 'c2'
 AND q.part = t.part
 AND q.owner_id IS NULL
WHERE e.owner_id IS NULL AND e.level = 'c2';

COMMIT;
