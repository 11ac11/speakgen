"use client";

import styled from "styled-components";
import DashboardTable from "./DashboardTable";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

export default function TabContainer({
  activeTab,
}: {
  activeTab: "questions" | "exams" | "settings";
}) {
  return (
    <Container>
      {activeTab === "questions" && <DashboardTable />}
      {activeTab === "exams" && (
        <p>Your exam history and upcoming exams will be shown here.</p>
      )}
      {activeTab === "settings" && (
        <p>Modify your preferences and account settings here.</p>
      )}
    </Container>
  );
}
