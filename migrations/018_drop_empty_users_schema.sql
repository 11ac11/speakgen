-- The last of the pre-consolidation schemas.
--
-- 003 dropped the legacy users table but left the schema that held it, so
-- `users` has been sitting empty ever since. Nothing in the application names
-- it, and it holds no tables, views, sequences or functions.
--
-- `public` stays: it is the default schema every Postgres database has, and
-- dropping it breaks tooling that assumes it exists.
--
-- Separate from 017 rather than folded into it, because 017 has already been
-- applied and editing an applied migration makes the file disagree with what
-- actually ran.

BEGIN;

DROP SCHEMA users;

COMMIT;
