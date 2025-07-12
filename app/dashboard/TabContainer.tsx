"use client";

import { Suspense } from "react";
import styled from "styled-components";
import { Button, QuickStart } from "../components/ui";
import { useRouter } from "next/navigation";
import Table from "../components/Table";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 25px;
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
          <ButtonsRow>
            <Button
              text={"Create new question"}
              onClick={() => router.push("/question/new")}
              isBigButton
            />
            <QuickStart />
          </ButtonsRow>
          <div>
            {/* <h1>My Questions</h1> */}
            {/* <Table ownerId={ownerId} /> */}
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
