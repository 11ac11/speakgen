import { sql } from "@/lib/db";

export type Level = {
  code: string;
  label: string;
  minutes: number;
  enabled: boolean;
  parts: number[];
};

const SELECT_LEVEL = `
  SELECT l.code,
         l.label,
         l.minutes,
         l.enabled,
         COALESCE(
           (SELECT array_agg(lp.part ORDER BY lp.part)
              FROM content.level_parts lp
             WHERE lp.level = l.code),
           '{}'
         ) AS parts
    FROM content.levels l
`;

export async function listLevels(): Promise<Level[]> {
  return (await sql(
    `${SELECT_LEVEL} WHERE l.enabled ORDER BY l.sort_order`,
    []
  )) as unknown as Level[];
}

/**
 * Resolves a level from a URL segment. Returns null for anything unknown or
 * not yet offered, which the [level] layout turns into a 404.
 *
 * This matters more than it looks: [level] is a dynamic segment at the root of
 * the app, so without it every unmatched first path segment would render a
 * level page for a level that does not exist.
 */
export async function getLevel(code: string): Promise<Level | null> {
  if (!/^[a-z0-9]{1,8}$/i.test(code)) return null;

  const rows = (await sql(`${SELECT_LEVEL} WHERE l.code = $1 AND l.enabled`, [
    code.toLowerCase()
  ])) as unknown as Level[];

  return rows[0] ?? null;
}
