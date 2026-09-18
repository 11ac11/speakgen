-- Ten more C1 Part 1 questions, taking the level to twenty.
--
-- The existing ten cover nine of the eighteen themes and lean heavily on two
-- of them: daily_life appears four times, work_education three. These cover
-- the nine that Part 1 had nothing for, one each, plus one that pairs two:
--
--   entertainment, environment, food_cooking, nature, shopping_fashion,
--   sports, technology, travel_holidays, your_culture
--
-- They also deliberately vary what the question asks the candidate to *do*,
-- not only what it is about. The existing ten are all reflective in the same
-- shape — "How has X changed", "How important is Y" — so the random picker
-- feels repetitive however many topics it draws from. These are a mix of
-- past-against-present, hypothetical, preference with a justification, and
-- opinion on a general trend.
--
-- C1 Part 1 runs about two minutes for the pair, so each question has to be
-- answerable in twenty or thirty seconds while asking for more than a clause.
-- Everything is owner_id NULL and public, like the rest of the house content,
-- and under the 200 characters questionPayloadSchema allows.

BEGIN;

INSERT INTO content.questions (level, part, owner_id, visibility, statement)
VALUES
  -- trend
  ('c1', 1, NULL, 'public', 'Do you think people have become better or worse at switching off from technology?'),
  -- past against present
  ('c1', 1, NULL, 'public', 'Has the way people travel changed much since you were a child?'),
  -- preference, with a reason
  ('c1', 1, NULL, 'public', 'Would you rather cook something ambitious or something you know will work?'),
  -- past against present
  ('c1', 1, NULL, 'public', 'Has the way people follow sport changed the experience of it?'),
  -- hypothetical
  ('c1', 1, NULL, 'public', 'If you could only keep one form of entertainment, which would you find hardest to give up?'),
  -- past against present
  ('c1', 1, NULL, 'public', 'Do you think people notice the natural world around them as much as they used to?'),
  -- hypothetical
  ('c1', 1, NULL, 'public', 'If you had to change one habit for environmental reasons, which would be hardest?'),
  -- trend
  ('c1', 1, NULL, 'public', 'Do you think what people wear says as much about them as it used to?'),
  -- preference, with a reason
  ('c1', 1, NULL, 'public', 'What would you want a visitor to understand about your culture before they arrived?'),
  -- trend
  ('c1', 1, NULL, 'public', 'Has having so much choice made it harder to decide what to watch or listen to?');

INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN (VALUES
  ('Do you think people have become better or worse at switching off from technology?', 'technology'),
  ('Do you think people have become better or worse at switching off from technology?', 'daily_life'),
  ('Has the way people travel changed much since you were a child?', 'travel_holidays'),
  ('Would you rather cook something ambitious or something you know will work?', 'food_cooking'),
  ('Would you rather cook something ambitious or something you know will work?', 'daily_life'),
  ('Has the way people follow sport changed the experience of it?', 'sports'),
  ('If you could only keep one form of entertainment, which would you find hardest to give up?', 'entertainment'),
  ('Do you think people notice the natural world around them as much as they used to?', 'nature'),
  ('Do you think people notice the natural world around them as much as they used to?', 'environment'),
  ('If you had to change one habit for environmental reasons, which would be hardest?', 'environment'),
  ('If you had to change one habit for environmental reasons, which would be hardest?', 'daily_life'),
  ('Do you think what people wear says as much about them as it used to?', 'shopping_fashion'),
  ('What would you want a visitor to understand about your culture before they arrived?', 'your_culture'),
  ('What would you want a visitor to understand about your culture before they arrived?', 'travel_holidays'),
  ('Has having so much choice made it harder to decide what to watch or listen to?', 'entertainment'),
  ('Has having so much choice made it harder to decide what to watch or listen to?', 'technology')
) AS t(statement, slug) ON t.statement = q.statement
WHERE q.level = 'c1' AND q.part = 1 AND q.owner_id IS NULL;

COMMIT;
