-- Keep the legacy public.users table available for historical ownership data,
-- while making Neon Auth the canonical identity source for new users.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_identities (
  auth_user_id uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  legacy_user_id integer UNIQUE REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_identities_legacy_user_id_idx
  ON public.user_identities (legacy_user_id);

CREATE INDEX IF NOT EXISTS b2_part1_owner_id_idx ON b2.part1 (owner_id);
CREATE INDEX IF NOT EXISTS b2_part2_owner_id_idx ON b2.part2 (owner_id);
CREATE INDEX IF NOT EXISTS b2_part3_owner_id_idx ON b2.part3 (owner_id);
CREATE INDEX IF NOT EXISTS b2_part4_owner_id_idx ON b2.part4 (owner_id);
CREATE INDEX IF NOT EXISTS c1_part1_owner_id_idx ON c1.part1 (owner_id);
CREATE INDEX IF NOT EXISTS c1_part2_owner_id_idx ON c1.part2 (owner_id);
CREATE INDEX IF NOT EXISTS c1_part3_owner_id_idx ON c1.part3 (owner_id);
CREATE INDEX IF NOT EXISTS c1_part4_owner_id_idx ON c1.part4 (owner_id);

COMMIT;