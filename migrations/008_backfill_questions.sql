-- Backfill content.questions from the legacy schemas.
--
-- After 005 the corpus is 68 rows, all house content: 66 B2 Part 1, one B2
-- Part 2, one C2 Part 2. The legacy tables are left intact as the rollback path
-- and are dropped in 012 once the application has cut over.

BEGIN;

-- B2 Part 1 ------------------------------------------------------------------
INSERT INTO content.questions (level, part, owner_id, visibility, statement, legacy_level, legacy_id)
SELECT 'b2', 1, owner_id::uuid, CASE WHEN public THEN 'public' ELSE 'private' END,
       statement, 'b2', id
FROM b2.part1
ORDER BY id;

-- B2 Part 2 ------------------------------------------------------------------
-- needs_review: the real B2 long turn ends with a 30-second question the other
-- candidate answers about the same photographs. There was nowhere to store it
-- before this migration, so it has to be written by hand.
INSERT INTO content.questions (level, part, owner_id, visibility, statement, image_ids,
                               needs_review, legacy_level, legacy_id)
SELECT 'b2', 2, owner_id::uuid, CASE WHEN public THEN 'public' ELSE 'private' END,
       statement, image_ids, true, 'b2', id
FROM b2.part2
ORDER BY id;

-- C2 Part 2 ------------------------------------------------------------------
-- A collaborative task: one photo and an opening question, then all photos and
-- a decision task, staged by the instructions array.
INSERT INTO content.questions (level, part, owner_id, visibility, statement, statement_two,
                               image_ids, instructions, legacy_level, legacy_id)
SELECT 'c2', 2, owner_id::uuid, CASE WHEN public THEN 'public' ELSE 'private' END,
       statement, statement_two, image_ids, instructions, 'c2', id
FROM c2.part2
ORDER BY id;

-- Themes ---------------------------------------------------------------------
INSERT INTO content.question_themes (question_id, theme_slug)
SELECT q.id, t.slug
FROM content.questions q
JOIN LATERAL (
  SELECT unnest(themes) AS slug FROM b2.part1 WHERE q.legacy_level = 'b2' AND q.part = 1 AND id = q.legacy_id
  UNION ALL
  SELECT unnest(themes)         FROM b2.part2 WHERE q.legacy_level = 'b2' AND q.part = 2 AND id = q.legacy_id
  UNION ALL
  SELECT unnest(themes)         FROM c2.part2 WHERE q.legacy_level = 'c2' AND q.part = 2 AND id = q.legacy_id
) t ON true
ON CONFLICT DO NOTHING;

COMMIT;
