-- Drops the eleven legacy tables, and the three schemas holding them.
--
-- These are what content.questions replaced. One table per level and part,
-- with no foreign keys, no shared theme vocabulary and no way to express a
-- question belonging to a level — the level *was* the schema name, which is
-- why the old API interpolated it straight into the SQL.
--
-- Audited immediately before writing this:
--
--   68 legacy rows in total, 67 of them present in content.questions by
--   legacy_level and legacy_id. The single exception is c2.part2 id 1, which
--   was carried across and then deliberately removed in 016 — a follow-up
--   question referring to photographs the import had already lost. So nothing
--   here is unmigrated.
--
--   No foreign keys point into b2, c1 or c2. No views depend on them. No
--   application code names them; the only references left are in migrations
--   005 and 008, which is history rather than use.
--
-- The tables are dropped individually and without CASCADE, so anything that
-- unexpectedly depends on one aborts the whole transaction rather than being
-- quietly dropped along with it. The schemas are dropped afterwards, empty.
--
-- After this, migrations 005 and 008 can no longer be replayed against a fresh
-- database. They are already historical: 006 to 011 build and seed
-- content.questions from scratch.

BEGIN;

DROP TABLE b2.part1, b2.part2, b2.part3, b2.part4;
DROP TABLE c1.part1, c1.part2, c1.part3, c1.part4;
DROP TABLE c2.part1, c2.part2, c2.part3;

DROP SCHEMA b2, c1, c2;

COMMIT;
