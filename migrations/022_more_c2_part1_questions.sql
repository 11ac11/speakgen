-- Ten more C2 Part 1 questions, bringing the level to twenty.
--
-- 020 seeded ten, which was the one place C2 sat below C1: Part 2 has five
-- tasks against C1's five and Part 3 six cards against C1's four, but Part 1
-- had ten against twenty. Part 1 is also the part a teacher reaches for most,
-- because it is the one they run without setting anything up.
--
-- Written to the same brief as the first ten: personal rather than abstract,
-- because Part 1 is still an interview about the candidate at this level, but
-- open enough that a one-sentence answer is obviously not enough. The abstract
-- questions belong to the Part 3 discussion.

BEGIN;

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  ('c2', 1, NULL, 'public', 'How do you tell the difference between being busy and being productive?'),
  ('c2', 1, NULL, 'public', 'What sort of place do you find it easiest to think clearly in?'),
  ('c2', 1, NULL, 'public', 'Is there a habit of yours that other people find puzzling?'),
  ('c2', 1, NULL, 'public', 'How much do you rely on other people''s recommendations?'),
  ('c2', 1, NULL, 'public', 'What would you want more time for, if you had it?'),
  ('c2', 1, NULL, 'public', 'How do you feel about doing things you are not good at?'),
  ('c2', 1, NULL, 'public', 'What kind of conversations do you find most worth having?'),
  ('c2', 1, NULL, 'public', 'Has travelling ever changed your mind about a place?'),
  ('c2', 1, NULL, 'public', 'How important is it to you that your work leaves something behind?'),
  ('c2', 1, NULL, 'public', 'What do you find yourself defending about the place you come from?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('How do you tell the difference between being busy and being productive?', 'work_education'),
  ('How do you tell the difference between being busy and being productive?', 'daily_life'),
  ('What sort of place do you find it easiest to think clearly in?', 'where_you_live'),
  ('What sort of place do you find it easiest to think clearly in?', 'daily_life'),
  ('Is there a habit of yours that other people find puzzling?', 'daily_life'),
  ('How much do you rely on other people''s recommendations?', 'entertainment'),
  ('How much do you rely on other people''s recommendations?', 'family_friends'),
  ('What would you want more time for, if you had it?', 'hobbies'),
  ('What would you want more time for, if you had it?', 'dreams_ambitions'),
  ('How do you feel about doing things you are not good at?', 'learning_english'),
  ('How do you feel about doing things you are not good at?', 'dreams_ambitions'),
  ('What kind of conversations do you find most worth having?', 'family_friends'),
  ('Has travelling ever changed your mind about a place?', 'travel_holidays'),
  ('Has travelling ever changed your mind about a place?', 'your_culture'),
  ('How important is it to you that your work leaves something behind?', 'work_education'),
  ('How important is it to you that your work leaves something behind?', 'the_future'),
  ('What do you find yourself defending about the place you come from?', 'your_culture'),
  ('What do you find yourself defending about the place you come from?', 'where_you_live')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'c2' AND q.part = 1 AND q.owner_id IS NULL;

COMMIT;
