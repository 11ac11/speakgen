import { getUserOrganizationIds } from "@/lib/organizations";
import { getAuthenticatedUserId } from "@/lib/session";

/**
 * Who is asking, and which schools they belong to.
 *
 * Share links (a later migration) add a third kind here, at which point a
 * student following a teacher's link can read the private questions inside
 * that exam or practice and nothing else.
 */
export type Viewer =
  | { kind: "user"; userId: string; organizationIds: string[] }
  | { kind: "anonymous" };

export async function getViewer(): Promise<Viewer> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { kind: "anonymous" };

  return {
    kind: "user",
    userId,
    organizationIds: await getUserOrganizationIds(userId)
  };
}

/**
 * The single place that decides which questions a viewer may read.
 *
 * Every read path goes through this rather than inlining its own
 * `visibility = 'public' OR owner_id = $1`. Extending this one function covers
 * the whole application; scattered copies would have to be found individually,
 * and one of them would be missed.
 *
 * Three ways to reach a question: it is public, you wrote it, or your school
 * owns it. House content (owner_id IS NULL) is always public, enforced by the
 * questions_house_is_public constraint, so it needs no special case.
 *
 * Returns a SQL fragment plus the parameters it consumes, starting at
 * $<nextParamIndex>. The caller appends the params in the same order.
 */
export function questionReadPredicate(
  viewer: Viewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  if (viewer.kind !== "user") {
    return { clause: `q.visibility = 'public'`, params: [] };
  }

  const clauses = [
    `q.visibility = 'public'`,
    `q.owner_id = $${nextParamIndex}`
  ];
  const params: unknown[] = [viewer.userId];

  if (viewer.organizationIds.length > 0) {
    params.push(viewer.organizationIds);
    clauses.push(`q.organization_id = ANY($${nextParamIndex + 1}::uuid[])`);
  }

  return { clause: `(${clauses.join(" OR ")})`, params };
}

/**
 * Which exams a viewer may read. An exam with no owner is house content, free
 * and visible to logged-out visitors. Otherwise it is the author's, or their
 * school's.
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
  if (viewer.kind !== "user") {
    return { clause: `e.owner_id IS NULL`, params: [] };
  }

  const clauses = [`e.owner_id IS NULL`, `e.owner_id = $${nextParamIndex}`];
  const params: unknown[] = [viewer.userId];

  if (viewer.organizationIds.length > 0) {
    params.push(viewer.organizationIds);
    clauses.push(`e.organization_id = ANY($${nextParamIndex + 1}::uuid[])`);
  }

  return { clause: `(${clauses.join(" OR ")})`, params };
}

/**
 * Which practices a viewer may read. The same three ways in as an exam: house
 * content, your own, or your school's.
 *
 * Unlike an exam, reaching a practice does not decide which questions are in
 * it. A practice draws from whatever the viewer running it may read, through
 * questionReadPredicate, so the same practice run by its author and by a
 * colleague in another school legitimately draws from different pools. That
 * falls out of the design rather than being a rule imposed here: a practice
 * stores a filter, and a filter is evaluated against the reader.
 */
export function practiceReadPredicate(
  viewer: Viewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  if (viewer.kind !== "user") {
    return { clause: `p.owner_id IS NULL`, params: [] };
  }

  const clauses = [`p.owner_id IS NULL`, `p.owner_id = $${nextParamIndex}`];
  const params: unknown[] = [viewer.userId];

  if (viewer.organizationIds.length > 0) {
    params.push(viewer.organizationIds);
    clauses.push(`p.organization_id = ANY($${nextParamIndex + 1}::uuid[])`);
  }

  return { clause: `(${clauses.join(" OR ")})`, params };
}
