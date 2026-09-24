import { Suspense } from "react";
import { redirect } from "next/navigation";
import TabMenu from "./TabMenu";
import TabContainer from "./TabContainer";
import * as React from "react";
import { getAuthenticatedUserId } from "@/lib/session";
import { getUsage } from "@/lib/limits";
import { listExams } from "@/lib/exams";
import { listPractices } from "@/lib/practices";
import { getViewer } from "@/lib/questionAccess";
import AdSlot from "@/app/components/ads/AdSlot";
import { entitlementsFor } from "@/lib/entitlements";
import { isWaitlistMode } from "@/lib/waitlist";

const validTabs = ["questions", "exams", "practices"] as const;
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

  const [allExams, allPractices] = await Promise.all([
    listExams(viewer),
    listPractices(viewer)
  ]);

  const myExams = allExams
    .filter((exam) => exam.owner_id === userId)
    .map((exam) => ({
      id: exam.id,
      level: exam.level,
      title: exam.title,
      question_count: exam.question_count,
      shared: exam.shared,
      themes: exam.themes
    }));

  /* Filtered here rather than in the query for the same reason as exams: the
     listing a teacher may read includes house content and their school's, and
     this tab is the narrower "mine". */
  const myPractices = allPractices
    .filter((practice) => practice.owner_id === userId)
    .map((practice) => ({
      id: practice.id,
      level: practice.level,
      title: practice.title,
      part: practice.part,
      question_count: practice.question_count,
      shared: practice.shared,
      themes: practice.themes
    }));

  return (
    <div className="page">
      <TabMenu activeTab={activeTab} />
      <Suspense fallback={<p>Loading content...</p>}>
        <TabContainer
          activeTab={activeTab}
          usage={{ exams: usage.exams, practices: usage.practices }}
          pdfExport={entitlementsFor(usage.plan).pdfExport}
          waitlist={{ mode: isWaitlistMode(), joined: usage.joinedWaitlist }}
          exams={myExams}
          practices={myPractices}
        />
      </Suspense>
      <AdSlot placement="dashboard" />
    </div>
  );
}
