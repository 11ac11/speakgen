-- Neon Auth user IDs are UUID strings. Preserve legacy values while making
-- every legacy question table able to store the canonical Neon Auth ID.

BEGIN;

ALTER TABLE b2.part1 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE b2.part2 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE b2.part3 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE b2.part4 ALTER COLUMN owner_id TYPE text USING owner_id::text;

ALTER TABLE c1.part1 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE c1.part2 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE c1.part3 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE c1.part4 ALTER COLUMN owner_id TYPE text USING owner_id::text;

ALTER TABLE c2.part1 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE c2.part2 ALTER COLUMN owner_id TYPE text USING owner_id::text;
ALTER TABLE c2.part3 ALTER COLUMN owner_id TYPE text USING owner_id::text;

COMMIT;