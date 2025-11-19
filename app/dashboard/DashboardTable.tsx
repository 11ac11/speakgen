"use client";

import React, { useState } from "react";
import { stackClientApp } from "@/stack/client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import Table from "../components/Table";
import { Button, Dropdown, QuickStart } from "../components/ui";
import { getQuestionPartOptions, SUPPORTED_LEVELS } from "@/constants";

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
  const [filters, setFilters] = useState({ part: "all", level: "b2" });
  const router = useRouter();
  const user = stackClientApp.useUser();

  if (!user) {
    return <></>;
  }

  console.log("user:", user);
  const ownerId = user?.id; // TODO: make dynamic

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <>
      <FiltersRow>
        <LeftSide>
          <Dropdown
            label="Level"
            width={"100px"}
            value={filters.level.toUpperCase()}
            options={SUPPORTED_LEVELS}
            onChange={(value) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                level: value.toLowerCase(),
              }))
            }
          />
          <Dropdown
            label="Part"
            disabled={filters.level === "all"}
            width={"100px"}
            value={capitalizeFirstLetter(filters.part)}
            options={["All", ...getQuestionPartOptions(filters.level)]}
            onChange={(value) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                part: value.toLowerCase(),
              }))
            }
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
      <Table ownerId={ownerId} filters={filters} />
    </>
  );
}
