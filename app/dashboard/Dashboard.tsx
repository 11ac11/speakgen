import { Suspense } from "react";
import { redirect } from "next/navigation";
import TabMenu from "./TabMenu";
import TabContainer from "./TabContainer";
import * as React from "react";
import { getAuthenticatedUserId } from "@/lib/session";
import { getUsage } from "@/lib/limits";
import { isBillingEnabled, isBillingSimulated } from "@/lib/billing/provider";
import { getSubscriptionForUser } from "@/lib/billing/reconcile";
import { listExams } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";

const validTabs = ["questions", "exams", "settings"] as const;
type Tab = (typeof validTabs)[number];

export default async function Dashboard({ tab }: { tab: string | undefined }) {
  if (!tab) {
    redirect("?tab=questions");
  }

  const activeTab: Tab = validTabs.includes(tab as Tab)
    ? (tab as Tab)
    : "questions";

  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?callbackUrl=/dashboard");

  // Loaded here rather than in the client tabs: this is a server component, so
  // the plan and the usage come straight from the database with no extra round
  // trip and no chance of the client being told a plan it can edit.
  const [usage, subscription, viewer] = await Promise.all([
    getUsage(userId),
    getSubscriptionForUser(userId),
    getViewer()
  ]);

  const allExams = await listExams(viewer);
  const myExams = allExams
    .filter((exam) => exam.owner_id === userId)
    .map((exam) => ({
      id: exam.id,
      level: exam.level,
      title: exam.title,
      question_count: exam.question_count
    }));

  const renewsAt = subscription?.current_period_end
    ? new Date(String(subscription.current_period_end)).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <>
      <TabMenu activeTab={activeTab} />
      <Suspense fallback={<p>Loading content...</p>}>
        <TabContainer
          activeTab={activeTab}
          plan={usage.plan}
          usage={{ exams: usage.exams, practices: usage.practices }}
          billing={{
            enabled: isBillingEnabled(),
            simulated: isBillingSimulated(),
            interval: (subscription?.billing_interval as string) ?? null,
            renewsAt,
            cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end)
          }}
          exams={myExams}
        />
      </Suspense>
    </>
  );
}
