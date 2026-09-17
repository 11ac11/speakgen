"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
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

// Centre, not flex-end: the two controls have different intrinsic heights
// (one carries a chevron), so bottom-aligning them left them visibly offset.
const RightSide = styled(LeftSide)`
  align-items: center;
`;

// No local button styling: it used to re-declare radius, padding and border on
// top of the shared button, which is why Create and Quick Start disagreed.
const Dashboardbutton = styled(Button)`
  display: flex;
  align-items: center;
`;

export default function DashboardTable() {
  const [filters, setFilters] = useState({ part: "all", level: "b2" });
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const ownerId = session?.user?.id || "";

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
                level: value.toLowerCase()
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
                part: value.toLowerCase()
              }))
            }
          />
        </LeftSide>
        <RightSide>
          <Dashboardbutton
            text={"Create"}
            onClick={() => router.push("/questions/new")}
            isBigButton
          />
          <QuickStart isDashboardButton />
        </RightSide>
      </FiltersRow>
      <Table ownerId={ownerId} filters={filters} />
    </>
  );
}
