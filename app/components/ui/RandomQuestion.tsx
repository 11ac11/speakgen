"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "./";
import { SUPPORTED_LEVELS } from "@/constants";

/**
 * Starts the random flow: one question at a time, drawn from a level's bank,
 * with nothing saved.
 *
 * Was called QuickStart, which said when you would use it rather than what it
 * gave you. That was enough while it was the only way to get a question; once
 * practices existed, a teacher saw "Quick Start" next to "New practice" with
 * nothing to tell them apart. The word "practice" now means one thing — the
 * saved rule — so this had to stop borrowing it.
 *
 * It briefly read "Start a random question", to give it a verb while it sat in
 * the questions toolbar looking like a second Create. Moving it onto the tab
 * strip did that job better than the words could: nothing up there is a filter
 * or a label for the table, so the noun phrase is unambiguous again and the
 * shorter one is the better one.
 *
 * The width lives here rather than with the caller, and it has to allow for the
 * chevron: Dropdown draws that absolutely over the control, so a label sized to
 * fill the button runs underneath it.
 */
export default function RandomQuestion({
  isDashboardButton,
  width
}: {
  isDashboardButton?: boolean | undefined;
  width?: string | undefined;
}) {
  const router = useRouter();

  const handleStart = (value: string) => {
    router.push(`/${value.toLowerCase()}/questions/random/1`);
  };

  return (
    <Dropdown
      options={SUPPORTED_LEVELS}
      value={""}
      onChange={handleStart}
      placeholder="Random question"
      width={width || "200px"}
      inputAsButton={true}
      secondary
      isDashboardButton={isDashboardButton}
    />
  );
}
