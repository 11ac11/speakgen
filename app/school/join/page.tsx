import { notFound, redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/session";
import JoinSchool from "./JoinSchool";

export const dynamic = "force-dynamic";

export default async function JoinSchoolPage({
  searchParams
}: {
  searchParams: Promise<{ invitation?: string }>;
}) {
  const { invitation } = await searchParams;
  if (!invitation) notFound();

  // Signing in has to come first, and has to come back here afterwards:
  // accepting an invitation is what ties it to an account.
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/school/join?invitation=${invitation}`)}`
    );
  }

  const rows = (await sql(
    `SELECT o.name
       FROM neon_auth.invitation i
       JOIN neon_auth.organization o ON o.id = i."organizationId"
      WHERE i.id = $1 AND i.status = 'pending' AND i."expiresAt" > now()`,
    [invitation]
  )) as unknown as { name: string }[];

  // An expired or already-used invitation is indistinguishable from one that
  // never existed.
  if (rows.length === 0) notFound();

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <JoinSchool invitationId={invitation} schoolName={rows[0].name} />
    </div>
  );
}
