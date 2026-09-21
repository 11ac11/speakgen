-- Switches C2 Proficiency on.
--
-- 016 left this deliberately: content.levels.c2 and its three
-- content.level_parts rows have been in place since 006, so offering the level
-- is flipping a boolean rather than writing schema. content.levels.enabled is
-- what getLevel and listLevels filter on, so this is what makes /c2/... resolve
-- and what lets questions and exams be created at the level.
--
-- 020 seeds the house content. This migration on its own gives an empty level,
-- which is a working state — the same one C1 was in before 011 — but not one
-- worth deploying alone.

BEGIN;

UPDATE content.levels SET enabled = true WHERE code = 'c2';

COMMIT;
