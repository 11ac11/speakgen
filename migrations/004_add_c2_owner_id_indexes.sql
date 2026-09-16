-- Migration 002 added owner_id indexes for b2 and c1 but omitted c2.
-- Every question lookup filters on owner_id, so c2 was left doing
-- sequential scans. Additive and safe to re-run.

BEGIN;

CREATE INDEX IF NOT EXISTS c2_part1_owner_id_idx ON c2.part1 (owner_id);
CREATE INDEX IF NOT EXISTS c2_part2_owner_id_idx ON c2.part2 (owner_id);
CREATE INDEX IF NOT EXISTS c2_part3_owner_id_idx ON c2.part3 (owner_id);

COMMIT;
