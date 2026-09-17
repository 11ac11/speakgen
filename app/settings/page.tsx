import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthenticatedUserId } from "@/lib/session";
import { ensureProfile } from "@/lib/profile";
import { getUsage } from "@/lib/limits";
import { isBillingEnabled, isBillingSimulated } from "@/lib/billing/provider";
import { getSubscriptionForUser } from "@/lib/billing/reconcile";
import {
  getMembers,
  getSeatUsage,
  getUserOrganizations
} from "@/lib/organizations";
import PlanPanel from "@/app/components/PlanPanel";
import SchoolPanel from "@/app/components/SchoolPanel";

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
  const [usage, subscription, organizations] = await Promise.all([
    getUsage(userId),
    getSubscriptionForUser(userId),
    getUserOrganizations(userId)
  ]);

  const school = organizations[0] ?? null;
  const [members, seats] = school
    ? await Promise.all([getMembers(school.id), getSeatUsage(school.id)])
    : [[], { members: 0, pending: 0, seats: 0, used: 0 }];

  const host = (await headers()).get("host") ?? "localhost:3001";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;

  const renewsAt = subscription?.current_period_end
    ? new Date(String(subscription.current_period_end)).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <h1 style={{ marginBottom: "0.75rem" }}>Settings</h1>

        <PlanPanel
          plan={usage.plan}
          usage={{ exams: usage.exams, practices: usage.practices }}
          billing={{
            enabled: isBillingEnabled(),
            simulated: isBillingSimulated(),
            interval: (subscription?.billing_interval as string) ?? null,
            renewsAt,
            cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end)
          }}
        />

        <SchoolPanel
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
          canAdmin={["owner", "admin"].includes(school?.role ?? "")}
          origin={origin}
        />
      </div>
    </div>
  );
}
