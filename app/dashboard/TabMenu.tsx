"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Tab from "./Tab";
import styled from "styled-components";
import { RandomQuestion } from "@/app/components/ui";

/* The strip carries the rule, and the tabs and the one action sit on it —
   flex-end so the tabs' active indicator still lands on the rule itself.

   The action moved up here from the questions toolbar, where it sat beside
   Create and read as a second way to make something. It is not: it opens a
   question to run, saves nothing, and has no more to do with the questions tab
   than with the other two. On the strip it is what it is — a way out of your
   saved work and into a question, whichever tab you are looking at. */
const Strip = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--field-edge);
  flex-wrap: wrap;
`;

/* Was space-between with each tab fixed at 250px, which on a 960px page threw
   the two of them into opposite corners with a hole in the middle. A tab strip
   is a row of labels at the start of a rule. */
const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.75rem;
`;

/* Clear of the rule the tabs sit on: the tabs meet it because their indicator
   is part of it, and a button touching it would just look dropped. */
const Action = styled.div`
  margin-bottom: 0.5rem;
`;

/* The order the work happens in: questions are written first, then gathered
   into exams and practices. */
const LABELS: [string, string][] = [
  ["questions", "My Questions"],
  ["exams", "My Exams"],
  ["practices", "My Practices"]
];

export default function TabMenu({
  activeTab
}: {
  activeTab: "questions" | "exams" | "practices";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <Strip>
      {/* The tablist holds tabs and nothing else — a button that navigates
          away is not one, and putting it inside would have a screen reader
          announce it as a fourth tab. */}
      <TabContainer role="tablist">
        {LABELS.map(([tab, label]) => (
          <Tab
            key={tab}
            onClick={() => handleTabChange(tab)}
            text={label}
            isActive={tab === activeTab}
          />
        ))}
      </TabContainer>
      <Action>
        {/* No width: the component sets one wide enough for its own label
            to clear the chevron, and a caller guessing at it is how the label
            ended up running underneath the arrow. */}
        <RandomQuestion isDashboardButton />
      </Action>
    </Strip>
  );
}
