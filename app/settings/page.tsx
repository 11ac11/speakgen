import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthenticatedUserId } from "@/lib/session";
import { ensureProfile } from "@/lib/profile";
import { getUsage } from "@/lib/limits";
import { isBillingEnabled, isBillingSimulated } from "@/lib/billing/provider";
import {
  getSubscriptionForViewer,
  getSubscriptionInScope
} from "@/lib/billing/reconcile";
import {
  getMembers,
  getSeatUsage,
  getUserOrganizations
} from "@/lib/organizations";
import PlanPanel from "@/app/components/PlanPanel";
import SchoolPanel from "@/app/components/SchoolPanel";
import BrandingPanel from "@/app/components/BrandingPanel";
import DeleteAccountPanel from "@/app/components/DeleteAccountPanel";
import { sql } from "@/lib/db";
import { getBrandingSettings, isBrandingEntitled } from "@/lib/branding";
import { isLogoStorageEnabled } from "@/lib/logoStorage";
import type { Metadata } from "next";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("Settings");

export const dynamic = "force-dynamic";

/**
 * Settings used to be the third tab of the dashboard, which put a teacher's
 * plan and their school behind the same URL as their content. It is its own
 * page now: the dashboard is the work, this is the account.
 */
export default async function SettingsPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?callbackUrl=/settings");

  await ensureProfile(userId);

  // Server-side, so the plan and usage come straight from the database with no
  // extra round trip and no chance of the client being told a plan it can edit.
  const [usage, subscription, personalSubscription, organizations] =
    await Promise.all([
      getUsage(userId),
      getSubscriptionForViewer(userId),
      getSubscriptionInScope(userId, "personal"),
      getUserOrganizations(userId)
    ]);

  // Paying twice: their own Pro is still live, but the plan in force is their
  // school's Academy, which already includes everything Pro does.
  const paysTwice =
    Boolean(subscription?.organization_id) &&
    Boolean(personalSubscription) &&
    !personalSubscription?.cancel_at_period_end;

  // For the delete-account confirmation, which asks for it to be typed.
  const [account] = (await sql(
    `SELECT email FROM neon_auth."user" WHERE id = $1`,
    [userId]
  )) as unknown as { email: string }[];
  const email = account?.email ?? "";

  const school = organizations[0] ?? null;
  const canAdmin = ["owner", "admin"].includes(school?.role ?? "");
  const [members, seats] = school
    ? await Promise.all([getMembers(school.id), getSeatUsage(school.id)])
    : [[], { members: 0, pending: 0, seats: 0, used: 0 }];

  // Branding belongs to the school, so only its admins see the panel, and only
  // once there is a school to brand.
  const [branding, brandingEntitled] =
    school && canAdmin
      ? await Promise.all([
          getBrandingSettings(school.id),
          isBrandingEntitled(school.id)
        ])
      : [null, false];

  const host = (await headers()).get("host") ?? "localhost:3001";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;

  const renewsAt = subscription?.current_period_end
    ? new Date(String(subscription.current_period_end)).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <div className="page page-narrow" style={{ paddingTop: "3rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h1 style={{ marginBottom: "0.75rem" }}>Settings</h1>

        <PlanPanel
          plan={usage.plan}
          usage={{ exams: usage.exams, practices: usage.practices }}
          billing={{
            enabled: isBillingEnabled(),
            simulated: isBillingSimulated(),
            interval: subscription?.billing_interval ?? null,
            renewsAt,
            cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
            // Whose subscription this is, when it is a school's, and whether
            // this teacher may manage it or is simply covered by it.
            schoolName: subscription?.school_name ?? null,
            canManage: subscription ? subscription.can_manage : true,
            ownPlanCoveredBySchool: paysTwice
          }}
        />

        <SchoolPanel
          plan={usage.plan}
          school={school ? { id: school.id, name: school.name } : null}
          members={members.map((m) => ({
            user_id: m.user_id,
            name: m.name,
            email: m.email,
            role: m.role
          }))}
          seats={{
            used: seats.used,
            seats: seats.seats,
            pending: seats.pending
          }}
          canAdmin={canAdmin}
          origin={origin}
        />

        {school && canAdmin && branding ? (
          <BrandingPanel
            organizationId={school.id}
            organizationName={branding.organizationName}
            entitled={brandingEntitled}
            logoStorageEnabled={isLogoStorageEnabled()}
            initial={{
              displayName: branding.displayName,
              accentColor: branding.accentColor,
              logoUrl: branding.logoUrl
            }}
          />
        ) : null}

        {/* Last on the page, and asked for rather than offered: it cannot be
            undone. */}
        <DeleteAccountPanel email={email} />
      </div>
    </div>
  );
}
