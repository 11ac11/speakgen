"use client";

import RowMenu from "./RowMenu";

// part is no longer needed: a question id identifies it, and the edit URL is
// level-scoped rather than part-scoped.
export default function Actions({
  questionId,
  level,
  handleDelete
}: {
  questionId: number;
  level: string;
  handleDelete: (id: number) => void;
}) {
  return (
    <RowMenu
      className="actions"
      ariaLabel="Question actions"
      items={[
        { label: "Edit", href: `/${level}/questions/${questionId}` },
        {
          label: "Delete",
          danger: true,
          onSelect: () => handleDelete(questionId)
        }
      ]}
    />
  );
}
