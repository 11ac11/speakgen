import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import { parseId } from "@/lib/ids";
import { getUserOrganizationIds } from "@/lib/organizations";
import type { ShareViewer } from "@/lib/questionAccess";

/**
 * Share links: one private URL per exam or practice that a student can run
 * without an account. Free on every plan, because they are how the product
 * spreads — see the plan notes in lib/entitlements.ts.
 */

export type ShareKind = "exam" | "practice";

export type ShareTarget = { kind: ShareKind; id: number };

export type ShareLink = {
  token: string;
  created_at: string;
};

/** What following a link resolves to: where to go, and who to go as. */
export type ResolvedShareLink = {
  kind: ShareKind;
  id: number;
  level: string;
  /** The school that owns the target, which is whose branding it wears. */
  organizationId: string | null;
  viewer: ShareViewer;
};

// Chosen here rather than interpolated from the kind, as lib/limits.ts does, so
// these are the only table and column names the queries below can take.
const TABLES: Record<ShareKind, { table: string; column: string }> = {
  exam: { table: "content.exams", column: "exam_id" },
  practice: { table: "content.practices", column: "practice_id" }
};

export function isShareKind(value: unknown): value is ShareKind {
  return value === "exam" || value === "practice";
}

export function parseShareTarget(kind: unknown, id: unknown) {
  if (!isShareKind(kind)) return null;
  const parsed = parseId(String(id ?? ""));
  return parsed === null ? null : { kind, id: parsed };
}

/** 16 random bytes, base64url: 22 characters, matching the column's CHECK. */
function newToken() {
  return randomBytes(16).toString("base64url");
}

/**
 * Whether this user may share, and so un-share, the target: its author, or a
 * colleague at the school that owns it. The same rule as editing it. House
 * content has no owner and no school, so it matches neither and is never
 * shareable — it is already free to anyone without a link.
 *
 * Returns the target's level, which the link row needs, or null.
 */
async function levelIfManageable(
  userId: string,
  target: ShareTarget
): Promise<string | null> {
  const { table } = TABLES[target.kind];
  const organizationIds = await getUserOrganizationIds(userId);

  const rows = (await sql(
    `SELECT level FROM ${table}
      WHERE id = $1
        AND (owner_id = $2 OR organization_id = ANY($3::uuid[]))
      LIMIT 1`,
    [target.id, userId, organizationIds]
  )) as unknown as { level: string }[];

  return rows[0]?.level ?? null;
}

/**
 * The live link for a target, if the user may manage it. `undefined` means
 * they may not, which callers turn into a 404 so that somebody else's exam and
 * a missing one look the same.
 */
export async function getShareLink(
  userId: string,
  target: ShareTarget
): Promise<ShareLink | null | undefined> {
  if ((await levelIfManageable(userId, target)) === null) return undefined;

  const { column } = TABLES[target.kind];
  const rows = (await sql(
    `SELECT token, created_at FROM content.share_links
      WHERE ${column} = $1 AND revoked_at IS NULL
      LIMIT 1`,
    [target.id]
  )) as unknown as ShareLink[];

  return rows[0] ?? null;
}

/**
 * The target's live link, made if there is none.
 *
 * Idempotent, so the Share button can simply ask for "the link": pressing it
 * twice, or two teachers at the same school pressing it at once, gives one
 * link. The partial unique index is what makes the race safe — the losing
 * insert does nothing and the read that follows finds the winner's row.
 */
export async function createShareLink(
  userId: string,
  target: ShareTarget
): Promise<ShareLink | null> {
  const level = await levelIfManageable(userId, target);
  if (level === null) return null;

  const { column } = TABLES[target.kind];

  await sql(
    `INSERT INTO content.share_links (token, level, ${column}, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (${column})
       WHERE ${column} IS NOT NULL AND revoked_at IS NULL
       DO NOTHING`,
    [newToken(), level, target.id, userId]
  );

  const rows = (await sql(
    `SELECT token, created_at FROM content.share_links
      WHERE ${column} = $1 AND revoked_at IS NULL
      LIMIT 1`,
    [target.id]
  )) as unknown as ShareLink[];

  return rows[0] ?? null;
}

/**
 * Stops the live link working. Anyone who has it gets a 404 from then on, and
 * sharing again makes a new token rather than reviving this one, so a link
 * that leaked stays dead.
 *
 * Returns false when the target is not the user's to manage.
 */
export async function revokeShareLink(userId: string, target: ShareTarget) {
  if ((await levelIfManageable(userId, target)) === null) return false;

  const { column } = TABLES[target.kind];
  await sql(
    `UPDATE content.share_links SET revoked_at = now()
      WHERE ${column} = $1 AND revoked_at IS NULL`,
    [target.id]
  );

  return true;
}

/**
 * Resolves a token from a URL into the one thing it opens.
 *
 * The owner and school come from the target rather than from whoever made the
 * link, so a school exam shared by a teacher who has since left still draws on
 * the school's questions and wears the school's branding.
 */
export async function resolveShareLink(
  token: string
): Promise<ResolvedShareLink | null> {
  // Checked before the query so that a malformed token, which could never
  // match, costs nothing.
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) return null;

  const rows = (await sql(
    `SELECT s.level,
            s.exam_id::int     AS exam_id,
            s.practice_id::int AS practice_id,
            COALESCE(e.owner_id, p.owner_id)               AS owner_id,
            COALESCE(e.organization_id, p.organization_id) AS organization_id
       FROM content.share_links s
       LEFT JOIN content.exams e     ON e.id = s.exam_id
       LEFT JOIN content.practices p ON p.id = s.practice_id
      WHERE s.token = $1 AND s.revoked_at IS NULL
      LIMIT 1`,
    [token]
  )) as unknown as {
    level: string;
    exam_id: number | null;
    practice_id: number | null;
    owner_id: string | null;
    organization_id: string | null;
  }[];

  const row = rows[0];
  if (!row) return null;

  const kind: ShareKind = row.exam_id !== null ? "exam" : "practice";

  return {
    kind,
    id: (row.exam_id ?? row.practice_id) as number,
    level: row.level,
    organizationId: row.organization_id,
    viewer: {
      kind: "share",
      examId: row.exam_id,
      practiceId: row.practice_id,
      ownerId: row.owner_id,
      organizationId: row.organization_id
    }
  };
}

/** The path a link is served at. One place, so the panel and the page agree. */
export function sharePath(token: string) {
  return `/share/${token}`;
}
