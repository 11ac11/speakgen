"use client";

import { Suspense } from "react";
import styled from "styled-components";
import { Button } from "../components/ui";
import { useRouter } from "next/navigation";
import Table from "../components/Table";

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
  const router = useRouter();
  const ownerId = "2"; // intial

  return (
    <Container>
      {activeTab === "questions" && (
        <>
          <Button
            text={"Create new question"}
            onClick={() => router.push("/create-question")}
          />
          <div>
            {/* <h1>My Questions</h1> */}
            <Table ownerId={ownerId} />
          </div>
        </>
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
