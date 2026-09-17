import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/profile";

export async function getAuthenticatedUserId() {
  const { data: session } = await auth.getSession();
  return session?.user?.id ?? null;
}

/**
 * The user id, with their profile row guaranteed to exist.
 *
 * Use this on any path that will go on to read a plan or a limit. Plain
 * getAuthenticatedUserId is fine where only the id matters, which is most
 * read paths, and avoids a write on every request.
 */
export async function getAuthenticatedUserWithProfile() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const profile = await ensureProfile(userId);
  return { userId, profile };
}
