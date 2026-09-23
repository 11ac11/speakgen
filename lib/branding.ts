import { sql } from "@/lib/db";
import { entitlementsFor } from "@/lib/entitlements";
import { isAdmin } from "@/lib/organizations";

/**
 * School branding: what a school's students see on its shared links and PDFs.
 *
 * Settings and display are separate on purpose. The settings are kept whatever
 * the plan; whether they are shown is an Academy entitlement resolved on read,
 * so a lapsed subscription hides the branding without losing it.
 */

/** What a branded page or PDF needs. */
export type Branding = {
  name: string;
  accentColor: string | null;
  logoUrl: string | null;
};

/** What the settings form edits, plus the school name it falls back to. */
export type BrandingSettings = {
  organizationName: string;
  displayName: string | null;
  accentColor: string | null;
  logoUrl: string | null;
};

/**
 * Whether a school's plan includes branding, from its live subscription. The
 * school's own subscription only: a member's personal Pro does not brand the
 * school, and branding is not something a school inherits from its teachers.
 */
export async function isBrandingEntitled(organizationId: string) {
  const rows = (await sql(
    `SELECT plan FROM content.subscriptions
      WHERE organization_id = $1
        AND status IN ('trialing', 'active', 'past_due')
      LIMIT 1`,
    [organizationId]
  )) as unknown as { plan: string }[];

  return rows.length > 0 && entitlementsFor(rows[0].plan).branding;
}

export async function getBrandingSettings(
  organizationId: string
): Promise<BrandingSettings | null> {
  const rows = (await sql(
    `SELECT o.name AS organization_name,
            b.display_name, b.accent_color, b.logo_url
       FROM neon_auth.organization o
       LEFT JOIN content.organization_branding b
         ON b.organization_id = o.id
      WHERE o.id = $1`,
    [organizationId]
  )) as unknown as {
    organization_name: string;
    display_name: string | null;
    accent_color: string | null;
    logo_url: string | null;
  }[];

  const row = rows[0];
  if (!row) return null;

  return {
    organizationName: row.organization_name,
    displayName: row.display_name,
    accentColor: row.accent_color,
    logoUrl: row.logo_url
  };
}

/**
 * The branding to show for content a school owns, or null for unbranded.
 *
 * Null when there is no school, when the school's plan does not include
 * branding, or when it has never set any — a school that has set nothing looks
 * like the product rather than like a school with a blank header.
 */
export async function getActiveBranding(
  organizationId: string | null
): Promise<Branding | null> {
  if (!organizationId) return null;

  const [entitled, settings] = await Promise.all([
    isBrandingEntitled(organizationId),
    getBrandingSettings(organizationId)
  ]);

  if (!entitled || !settings) return null;
  if (!settings.displayName && !settings.accentColor && !settings.logoUrl) {
    return null;
  }

  return {
    name: settings.displayName ?? settings.organizationName,
    accentColor: settings.accentColor,
    logoUrl: settings.logoUrl
  };
}

export class BrandingForbiddenError extends Error {
  constructor(readonly reason: "not_admin" | "not_entitled") {
    super(
      reason === "not_admin"
        ? "Only a school's owner or an admin can change its branding"
        : "Branding is part of the Academy plan"
    );
    this.name = "BrandingForbiddenError";
  }
}

/** Admins of an Academy school, and nobody else, may change its branding. */
export async function assertCanBrand(userId: string, organizationId: string) {
  if (!(await isAdmin(userId, organizationId))) {
    throw new BrandingForbiddenError("not_admin");
  }
  if (!(await isBrandingEntitled(organizationId))) {
    throw new BrandingForbiddenError("not_entitled");
  }
}

/**
 * Saves the name and colour. Validation happens in the route, where the reason
 * can be given back; this assumes a normalised colour or null.
 */
export async function saveBranding(
  userId: string,
  organizationId: string,
  input: { displayName: string | null; accentColor: string | null }
) {
  await assertCanBrand(userId, organizationId);

  await sql(
    `INSERT INTO content.organization_branding
       (organization_id, display_name, accent_color, updated_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (organization_id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           accent_color = EXCLUDED.accent_color,
           updated_by   = EXCLUDED.updated_by`,
    [organizationId, input.displayName, input.accentColor, userId]
  );
}

/**
 * Points the branding at a new logo, or at none, and returns the URL it
 * replaced so the caller can remove it from storage.
 */
export async function setLogoUrl(
  userId: string,
  organizationId: string,
  logoUrl: string | null
): Promise<string | null> {
  await assertCanBrand(userId, organizationId);

  // The old value is read in the same statement that replaces it, so two
  // uploads racing cannot each think they replaced the original.
  const rows = (await sql(
    `WITH previous AS (
       SELECT logo_url FROM content.organization_branding
        WHERE organization_id = $1
        FOR UPDATE
     ), saved AS (
       INSERT INTO content.organization_branding
         (organization_id, logo_url, updated_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (organization_id) DO UPDATE
         SET logo_url = EXCLUDED.logo_url, updated_by = EXCLUDED.updated_by
       RETURNING 1
     )
     SELECT (SELECT logo_url FROM previous) AS previous FROM saved`,
    [organizationId, logoUrl, userId]
  )) as unknown as { previous: string | null }[];

  return rows[0]?.previous ?? null;
}
