import { Suspense } from "react";
import { redirect } from "next/navigation";
import TabMenu from "./TabMenu";
import TabContainer from "./TabContainer";
import * as React from "react";
import { getAuthenticatedUserId } from "@/lib/session";
import { getUsage } from "@/lib/limits";
import { listExams } from "@/lib/exams";
import { getViewer } from "@/lib/questionAccess";
import AdSlot from "@/app/components/ads/AdSlot";

const validTabs = ["questions", "exams"] as const;
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
  // the usage comes straight from the database with no extra round trip and no
  // chance of the client being told a limit it can edit.
  const [usage, viewer] = await Promise.all([getUsage(userId), getViewer()]);

  const allExams = await listExams(viewer);
  const myExams = allExams
    .filter((exam) => exam.owner_id === userId)
    .map((exam) => ({
      id: exam.id,
      level: exam.level,
      title: exam.title,
      question_count: exam.question_count
    }));

  return (
    <>
      <TabMenu activeTab={activeTab} />
      <Suspense fallback={<p>Loading content...</p>}>
        <TabContainer
          activeTab={activeTab}
          usage={{ exams: usage.exams }}
          exams={myExams}
        />
      </Suspense>
      <AdSlot placement="dashboard" />
    </>
  );
}
