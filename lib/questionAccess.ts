import { getUserOrganizationIds } from "@/lib/organizations";
import { getAuthenticatedUserId } from "@/lib/session";

/**
 * Who is asking, and which schools they belong to.
 *
 * The third kind is a student following a share link. It is only ever built by
 * the share page, from the link's own row (lib/shareLinks.ts), and it reaches
 * exactly one exam or one practice: every other page a student visits still
 * sees an anonymous visitor, because nothing about following a link is
 * remembered.
 */
export type Viewer =
  | { kind: "user"; userId: string; organizationIds: string[] }
  | { kind: "anonymous" }
  | ShareViewer;

export type ShareViewer = {
  kind: "share";
  /** The one exam or practice the link opens. The other is null. */
  examId: number | null;
  practiceId: number | null;
  /**
   * Whose question pool a shared practice draws from: its author's and its
   * school's. A practice is a rule evaluated against the reader, and a student
   * has no pool of their own, so without this a shared practice would draw
   * only house questions and silently leave out the teacher's own.
   */
  ownerId: string | null;
  organizationId: string | null;
};

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
 * owns it. Public means house content and nothing else — a question is public
 * exactly when it has no owner, which the questions_public_is_house constraint
 * holds (migration 029) — so `visibility = 'public'` is the house library.
 *
 * Returns a SQL fragment plus the parameters it consumes, starting at
 * $<nextParamIndex>. The caller appends the params in the same order.
 */
export function questionReadPredicate(
  viewer: Viewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  if (viewer.kind === "share")
    return sharedPoolPredicate(viewer, nextParamIndex);

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
  // The one exam on the link, and not the house exams an anonymous visitor
  // could read: a share page shows what it was shared for.
  if (viewer.kind === "share") {
    return viewer.examId === null
      ? { clause: `FALSE`, params: [] }
      : { clause: `e.id = $${nextParamIndex}`, params: [viewer.examId] };
  }

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
  if (viewer.kind === "share") {
    return viewer.practiceId === null
      ? { clause: `FALSE`, params: [] }
      : { clause: `p.id = $${nextParamIndex}`, params: [viewer.practiceId] };
  }

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

/**
 * The questions a shared practice may draw: house ones, and the private ones
 * of the teacher and school it belongs to. Their pool as a colleague would see
 * it, minus any other schools the author happens to belong to, which a link
 * made in one school has no business reaching into.
 *
 * Only a practice needs this. A shared exam's questions come through the exam,
 * as examReadPredicate explains, and never through here.
 */
function sharedPoolPredicate(
  viewer: ShareViewer,
  nextParamIndex: number
): { clause: string; params: unknown[] } {
  const clauses = [`q.visibility = 'public'`];
  const params: unknown[] = [];

  if (viewer.ownerId) {
    params.push(viewer.ownerId);
    clauses.push(`q.owner_id = $${nextParamIndex + params.length - 1}`);
  }

  if (viewer.organizationId) {
    params.push(viewer.organizationId);
    clauses.push(
      `q.organization_id = $${nextParamIndex + params.length - 1}::uuid`
    );
  }

  return { clause: `(${clauses.join(" OR ")})`, params };
}
