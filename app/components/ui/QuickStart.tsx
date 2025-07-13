import React from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "./";

export default function QuickStart({
  isDashboardButton,
  width,
}: {
  isDashboardButton?: boolean | undefined;
  width?: string | undefined;
}) {
  const router = useRouter();

  const handleQuickStart = (value: any) => {
    router.push(`/show-question/${value.toLowerCase()}/1`);
  };

  return (
    <Dropdown
      options={["B2", "C1", "C2"]}
      value={""}
      onChange={handleQuickStart}
      placeholder="Quick Start"
      width={width || "200px"}
      inputAsButton={true}
      isDashboardButton={isDashboardButton}
    />
  );
}
