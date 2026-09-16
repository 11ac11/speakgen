import { getAuthenticatedUserId } from "@/lib/session";

/**
 * Who is asking. Share links (migration 011) add a third kind here, at which
 * point a student following a teacher's link can read the private questions
 * inside that exam or practice and nothing else.
 */
export type Viewer = { kind: "user"; userId: string } | { kind: "anonymous" };

export async function getViewer(): Promise<Viewer> {
  const userId = await getAuthenticatedUserId();
  return userId ? { kind: "user", userId } : { kind: "anonymous" };
}

/**
 * The single place that decides which questions a viewer may read.
 *
 * Every read path goes through this rather than inlining its own
 * `visibility = 'public' OR owner_id = $1`. When shares arrive, extending this
 * one function covers the whole application; scattered copies of the predicate
 * would have to be found individually, and one of them would be missed.
 *
 * House content (owner_id IS NULL) is always visibility = 'public', enforced by
 * the questions_house_is_public constraint, so it needs no special case.
 *
 * Returns a SQL fragment plus the parameters it consumes, starting at
 * $<nextParamIndex>. The caller appends the params in the same order.
 */
export function questionReadPredicate(
  viewer: Viewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  if (viewer.kind === "user") {
    return {
      clause: `(q.visibility = 'public' OR q.owner_id = $${nextParamIndex})`,
      params: [viewer.userId]
    };
  }

  return { clause: `q.visibility = 'public'`, params: [] };
}

/**
 * Which exams a viewer may read. An exam with no owner is house content, free
 * and visible to logged-out visitors. A user's own exam is visible only to
 * them; there is no exam sharing between users.
 *
 * Access to the questions inside an exam comes from access to the exam itself,
 * not from each question's own visibility. That is what will let a student
 * follow a share link and see a teacher's private questions in that exam and
 * nowhere else.
 */
export function examReadPredicate(
  viewer: Viewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  if (viewer.kind === "user") {
    return {
      clause: `(e.owner_id IS NULL OR e.owner_id = $${nextParamIndex})`,
      params: [viewer.userId]
    };
  }

  return { clause: `e.owner_id IS NULL`, params: [] };
}
