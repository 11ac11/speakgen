import { auth } from "@/lib/auth/server";

export async function getAuthenticatedUserId() {
  const { data: session } = await auth.getSession();
  return session?.user?.id ?? null;
}
