"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Tab from "./Tab";
import styled from "styled-components";

const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 50%;
  margin-bottom: 20px;
  gap: 20px;
`;

export default function TabMenu({
  activeTab,
}: {
  activeTab: "questions" | "exams" | "settings";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <TabContainer>
      {["questions", "exams", "settings"].map((tab) => (
        <Tab
          key={tab}
          onClick={() => handleTabChange(tab)}
          text={
            tab === "questions"
              ? "My Questions"
              : tab === "exams"
              ? "My Exams"
              : "Settings"
          }
          isActive={tab === activeTab}
        />
      ))}
    </TabContainer>
  );
}
