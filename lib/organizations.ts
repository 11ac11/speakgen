import { sql } from "@/lib/db";

/**
 * Schools. Neon Auth owns the organization, member and invitation tables and
 * its organization plugin is enabled, so this reads them rather than
 * reimplementing membership.
 */

export type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
  member_count: number;
};

export type Member = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
};

/** Every school this user belongs to, with their role in each. */
export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  return (await sql(
    `SELECT o.id, o.name, o.slug, m.role,
            (SELECT count(*)::int FROM neon_auth.member m2
              WHERE m2."organizationId" = o.id) AS member_count
       FROM neon_auth.member m
       JOIN neon_auth.organization o ON o.id = m."organizationId"
      WHERE m."userId" = $1
      ORDER BY o.name`,
    [userId]
  )) as unknown as Organization[];
}

/**
 * Just the ids, for access checks.
 *
 * Read on nearly every request that resolves a visibility, so it stays a single
 * indexed lookup and returns an array the predicates can compare against.
 */
export async function getUserOrganizationIds(
  userId: string
): Promise<string[]> {
  const rows = (await sql(
    `SELECT "organizationId" AS id FROM neon_auth.member WHERE "userId" = $1`,
    [userId]
  )) as unknown as { id: string }[];

  return rows.map((row) => row.id);
}

/** The school a user is currently acting for, from their session. */
export async function getActiveOrganizationId(
  userId: string
): Promise<string | null> {
  const rows = (await sql(
    `SELECT "activeOrganizationId" AS id
       FROM neon_auth.session
      WHERE "userId" = $1 AND "expiresAt" > now()
      ORDER BY "createdAt" DESC
      LIMIT 1`,
    [userId]
  )) as unknown as { id: string | null }[];

  return rows[0]?.id ?? null;
}

/**
 * The school new content should belong to.
 *
 * The session's active organisation if there is one, otherwise the user's only
 * school. With no school, content is personal as before.
 */
export async function getOwningOrganizationId(
  userId: string
): Promise<string | null> {
  const active = await getActiveOrganizationId(userId);
  if (active) return active;

  const organizations = await getUserOrganizationIds(userId);
  return organizations.length === 1 ? organizations[0] : null;
}

export async function getMembers(organizationId: string): Promise<Member[]> {
  return (await sql(
    `SELECT m."userId" AS user_id, u.name, u.email, m.role,
            m."createdAt" AS joined_at
       FROM neon_auth.member m
       JOIN neon_auth."user" u ON u.id = m."userId"
      WHERE m."organizationId" = $1
      ORDER BY m."createdAt"`,
    [organizationId]
  )) as unknown as Member[];
}

export async function getPendingInvitations(
  organizationId: string
): Promise<Invitation[]> {
  return (await sql(
    `SELECT id, email, role, status, "expiresAt" AS expires_at
       FROM neon_auth.invitation
      WHERE "organizationId" = $1 AND status = 'pending' AND "expiresAt" > now()
      ORDER BY "createdAt" DESC`,
    [organizationId]
  )) as unknown as Invitation[];
}

export async function isMember(userId: string, organizationId: string) {
  const rows = (await sql(
    `SELECT 1 FROM neon_auth.member
      WHERE "userId" = $1 AND "organizationId" = $2 LIMIT 1`,
    [userId, organizationId]
  )) as unknown as unknown[];

  return rows.length > 0;
}

export async function isAdmin(userId: string, organizationId: string) {
  const rows = (await sql(
    `SELECT role FROM neon_auth.member
      WHERE "userId" = $1 AND "organizationId" = $2 LIMIT 1`,
    [userId, organizationId]
  )) as unknown as { role: string }[];

  return ["owner", "admin"].includes(rows[0]?.role ?? "");
}

/**
 * Seats in use against seats paid for.
 *
 * Pending invitations count. A seat that has been offered is spent, or a school
 * could invite twenty teachers against five seats and let them race.
 */
export async function getSeatUsage(organizationId: string) {
  const rows = (await sql(
    `SELECT
       (SELECT count(*)::int FROM neon_auth.member
         WHERE "organizationId" = $1) AS members,
       (SELECT count(*)::int FROM neon_auth.invitation
         WHERE "organizationId" = $1 AND status = 'pending'
           AND "expiresAt" > now()) AS pending,
       COALESCE((SELECT seats FROM content.subscriptions
                  WHERE organization_id = $1
                    AND status IN ('trialing', 'active', 'past_due')
                  LIMIT 1), 0) AS seats`,
    [organizationId]
  )) as unknown as { members: number; pending: number; seats: number }[];

  const usage = rows[0] ?? { members: 0, pending: 0, seats: 0 };
  return { ...usage, used: usage.members + usage.pending };
}
