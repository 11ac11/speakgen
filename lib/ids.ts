/**
 * Parses a positive integer out of a URL segment.
 *
 * Route parameters are arbitrary strings: /exams/b2 matches /exams/[id] just as
 * readily as /exams/1 does. Number("b2") is NaN, and passing that to a bigint
 * column makes Postgres raise, which surfaces as a 500 where the honest answer
 * is 404. Callers treat null as "no such row".
 */
export function parseId(value: string | number): number | null {
  const text = String(value);
  if (!/^\d+$/.test(text)) return null;

  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
