import { Suspense } from "react";
import { redirect } from "next/navigation";
import TabMenu from "./TabMenu"; // Client Component
import TabContainer from "./TabContainer"; // Client Component
import * as React from "react";

export default function Dashboard({ tab }: { tab: string | undefined }) {
  // Redirect if no valid tab is found
  if (!tab) {
    redirect("?tab=questions");
  }

  const validTabs = ["questions", "exams", "settings"];
  const activeTab = validTabs.includes(tab) ? tab : "questions";

  return (
    <>
      {/* Tab Menu (Client Component for navigation) */}
      <TabMenu activeTab={activeTab as "questions" | "exams" | "settings"} />

      {/* Tab Content (Client Component to switch content dynamically) */}
      <Suspense fallback={<p>Loading content...</p>}>
        <TabContainer
          activeTab={activeTab as "questions" | "exams" | "settings"}
        />
      </Suspense>
    </>
  );
}
