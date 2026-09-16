-- Curate the existing question bank into house content (owner_id IS NULL).
--
-- Three things happen here:
--   1. Test/scratch rows are deleted.
--   2. The Part 1 interview bank sitting in the c2 schema is re-levelled to b2.
--      Those questions ("What are your neighbours like?", "Do you come from a
--      large family?") are B2/C1 interview prompts, not C2 Proficiency material;
--      c2 was being used as scratch space.
--   3. Everything that survives becomes house content: owner_id NULL, public.
--
-- House content is the free tier's shop window. It is owned by no user, so no
-- user can edit or privatise it, which is what keeps sample exams from decaying.

BEGIN;

-- 1. Test and scratch rows.
DELETE FROM b2.part1 WHERE id IN (10, 11, 14, 15, 16, 17, 18, 29, 35, 37);
DELETE FROM c1.part1 WHERE id IN (2, 3);

-- 2. Theme slugs that do not exist in THEME_VALUES_FOR_PILLS. These would fail
--    the question_themes foreign key once themes become rows.
UPDATE b2.part1 SET themes = array_replace(themes, 'sport',   'sports')          WHERE 'sport'   = ANY (themes);
UPDATE b2.part1 SET themes = array_replace(themes, 'travel',  'travel_holidays') WHERE 'travel'  = ANY (themes);
UPDATE b2.part1 SET themes = array_replace(themes, 'fashion', 'shopping_fashion') WHERE 'fashion' = ANY (themes);
UPDATE b2.part1 SET themes = array_replace(themes, 'food',    'food_cooking')    WHERE 'food'    = ANY (themes);

-- 3. Re-level the c2 Part 1 bank into b2, skipping statements b2 already has.
--    id is GENERATED ALWAYS AS IDENTITY, so new ids are allocated here.
INSERT INTO b2.part1 (statement, themes, owner_id, public)
SELECT DISTINCT ON (btrim(statement))
       btrim(statement), themes, NULL, true
FROM c2.part1
WHERE btrim(statement) NOT IN (SELECT btrim(statement) FROM b2.part1)
ORDER BY btrim(statement), id;

DELETE FROM c2.part1;

-- 4. Promote the survivors to house content and trim stray whitespace.
UPDATE b2.part1 SET statement = btrim(statement), owner_id = NULL, public = true;
UPDATE b2.part2 SET statement = btrim(statement), owner_id = NULL, public = true;
UPDATE c2.part2 SET statement = btrim(statement), owner_id = NULL, public = true;

COMMIT;
