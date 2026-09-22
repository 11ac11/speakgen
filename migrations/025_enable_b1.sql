-- B1 Preliminary, the fourth level and the first one below B2.
--
-- Four parts, about twelve minutes for a pair — the shortest of the four. The
-- part count matches B2 and C1, so nothing here is unusual except the sort
-- order: B1 belongs at the front of the list rather than the back, and 0 puts
-- it there without renumbering the three that already exist. The column is a
-- smallint, so there is room below zero if something ever needs to go in front
-- of it.
--
-- What differs about B1 is inside Part 2, not in this table. Its long turn is
-- one photograph described on your own, where B2 and C1 compare two and C2's
-- Part 2 is a different task altogether. That is a property of the task rather
-- than of the level, so it lives in lib/cambridgeBlueprints.ts with the other
-- per-task rules — including the photograph count, which questionRules reads
-- from there now instead of assuming every Part 2 wants two to five.

BEGIN;

INSERT INTO content.levels (code, label, minutes, enabled, sort_order)
VALUES ('b1', 'B1 Preliminary', 12, true, 0)
ON CONFLICT (code) DO UPDATE
  SET label      = EXCLUDED.label,
      minutes    = EXCLUDED.minutes,
      enabled    = EXCLUDED.enabled,
      sort_order = EXCLUDED.sort_order;

INSERT INTO content.level_parts (level, part) VALUES
  ('b1', 1), ('b1', 2), ('b1', 3), ('b1', 4)
ON CONFLICT (level, part) DO NOTHING;

COMMIT;
