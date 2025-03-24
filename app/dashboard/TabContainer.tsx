"use client";

import { Suspense } from "react";
import styled from "styled-components";
import { Button } from "../components/ui";
import { useRouter } from "next/navigation";

const Container = styled.div`
  width: 100%;
`;

export default function TabContainer({
  activeTab,
}: {
  activeTab: "questions" | "exams" | "settings";
}) {
  const router = useRouter();

  return (
    <Container>
      {activeTab === "questions" && (
        <Button
          text={"Create new question"}
          onClick={() => router.push("/create-question")}
        />
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
