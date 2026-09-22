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
 * The width is generous on purpose. Dropdown draws its chevron absolutely
 * over the control, so a label that fills the button runs underneath it — at
 * 230px the final "n" sat behind the arrow.
 *
 * "Start a random question", not "Random question", because it sits among
 * things that are not actions — the tabs naming your saved work, the filters
 * naming what is in the table — and a bare noun phrase there reads as another
 * label rather than a thing to press. The verb is what says it takes you
 * somewhere. Not "Quick start" either, for the reason above: it describes the
 * occasion rather than what you get.
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
      placeholder="Start a random question"
      width={width || "265px"}
      inputAsButton={true}
      secondary
      isDashboardButton={isDashboardButton}
    />
  );
}
