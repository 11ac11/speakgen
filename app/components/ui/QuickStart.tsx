import React from "react";
import { Dropdown } from "./";

export default function QuickStart({}: {}) {
  const handleQuickStart = (value: any) => {
    console.log(value);
  };

  return (
    <Dropdown
      options={["B2", "C1", "C2"]}
      value={""}
      onChange={handleQuickStart}
      placeholder="Quick Start"
      width="200px"
      inputAsButton={true}
    />
  );
}
