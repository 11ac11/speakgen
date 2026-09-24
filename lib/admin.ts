import { auth } from "@/lib/auth/server";

/**
 * Who may see the admin pages: the email addresses in ADMIN_EMAILS,
 * comma-separated, set in Vercel's environment (and in .env locally).
 *
 * An environment variable rather than a role in the database, because there
 * is one admin and no screen to manage them; it can become a role when there
 * is a second. Everyone else — signed in or not — gets a 404, so the page does
 * not advertise that it exists.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminViewer(): Promise<boolean> {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email?.trim().toLowerCase();
  return Boolean(email) && adminEmails().includes(email as string);
}
