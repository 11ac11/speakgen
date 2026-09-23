-- School branding: the name, colour and logo a school's students see on shared
-- links and on exported PDFs.
--
-- A table of its own rather than columns on neon_auth.organization, for the
-- reason 006 gives for user_profiles: Neon Auth owns that table and may rebuild
-- it, and application columns must not live there.
--
-- Having a row does not mean it is shown. Branding is an Academy entitlement,
-- resolved on read from the school's subscription (lib/branding.ts), so a
-- school that stops paying keeps its settings and simply stops seeing them,
-- and gets them back on resubscribing without setting anything up again.

BEGIN;

CREATE TABLE content.organization_branding (
  organization_id uuid PRIMARY KEY
    REFERENCES neon_auth.organization (id) ON DELETE CASCADE,

  -- What students see. NULL falls back to the school's own name, so a school
  -- only sets this when the name on its account is not the name on its door.
  display_name text CHECK (char_length(display_name) BETWEEN 1 AND 80),

  -- #rrggbb. Contrast against white button text is checked in the
  -- application, where the reason can be explained; this only guards the shape.
  accent_color text CHECK (accent_color ~ '^#[0-9a-f]{6}$'),

  -- Where the logo lives. Stored here and never looked up by listing the
  -- store: see the Vercel Blob notes on why list() in a request path is the
  -- expensive mistake. NULL is no logo.
  logo_url     text,

  updated_by   uuid REFERENCES neon_auth."user" (id) ON DELETE SET NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER organization_branding_touch
  BEFORE UPDATE ON content.organization_branding
  FOR EACH ROW EXECUTE FUNCTION content.touch_updated_at();

COMMIT;
