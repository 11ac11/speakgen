-- Neon Auth is now the canonical identity store. The old public.users table
-- and bridge are no longer used by the application.

BEGIN;

DROP TABLE IF EXISTS public.user_identities;
DROP TABLE IF EXISTS public.users;

COMMIT;