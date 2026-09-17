"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Tab from "./Tab";
import styled from "styled-components";

/* Was space-between with each tab fixed at 250px, which on a 960px page threw
   the two of them into opposite corners with a hole in the middle. A tab strip
   is a row of labels at the start of a rule. */
const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 1.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--field-edge);
`;

export default function TabMenu({
  activeTab
}: {
  activeTab: "questions" | "exams";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <TabContainer role="tablist">
      {["questions", "exams"].map((tab) => (
        <Tab
          key={tab}
          onClick={() => handleTabChange(tab)}
          text={tab === "questions" ? "My Questions" : "My Exams"}
          isActive={tab === activeTab}
        />
      ))}
    </TabContainer>
  );
}
