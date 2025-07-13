"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import Table from "../components/Table";

import { Button, Dropdown, QuickStart } from "../components/ui";

const FiltersRow = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  justify-content: space-between;
  align-items: flex-end;
`;

const LeftSide = styled.div`
  display: flex;
  gap: 10px;
`;

const RightSide = styled(LeftSide)``;

const Dashboardbutton = styled(Button)`
  display: flex;
  align-items: flex-end;

  & button {
    display: flex;
    border-radius: 8px;
    border-style: solid;
    border-width: 1px;
    outline: none;
    padding: 0.5rem 1rem;
    font-size: 16px;
    font-weight: 700;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
`;

export default function DashboardTable({}: {}) {
  const router = useRouter();
  const ownerId = "2"; // intial

  return (
    <>
      <FiltersRow>
        <LeftSide>
          <Dropdown
            label="Level"
            width={"100px"}
            value={"All"}
            options={["All", "B2", "C1", "C2"]}
            onChange={function (option: string): void {
              throw new Error("Function not implemented.");
            }}
          />
          <Dropdown
            label="Part"
            width={"100px"}
            value={"1"}
            options={["1", "2", "3", "4"]}
            onChange={function (option: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        </LeftSide>
        <RightSide>
          <Dashboardbutton
            text={"Create"}
            onClick={() => router.push("/question/new")}
            isBigButton
          />
          <QuickStart isDashboardButton />
        </RightSide>
      </FiltersRow>
      <div>
        <Table ownerId={ownerId} />
      </div>
    </>
  );
}
