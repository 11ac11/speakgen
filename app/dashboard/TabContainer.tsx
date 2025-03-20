"use client";

import { Suspense } from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
`;

export default function TabContainer({
  activeTab,
}: {
  activeTab: "questions" | "exams" | "settings";
}) {
  return (
    <Container>
      {activeTab === "questions" && (
        <p>Your saved questions will appear here.</p>
      )}
      {activeTab === "exams" && (
        <p>Your exam history and upcoming exams will be shown here.</p>
      )}
      {activeTab === "settings" && (
        <p>Modify your preferences and account settings here.</p>
      )}
    </Container>
  );
}
