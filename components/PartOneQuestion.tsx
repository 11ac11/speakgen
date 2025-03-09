"use client";

import React from "react";

export default function PartOneQuestion({
  question,
  themes,
}: {
  question: string;
  themes: string[] | undefined | string;
}) {
  return (
    <div className="themeCont glass">
      <p className="themeText">{themes}</p>
      <h2>{question}</h2>
    </div>
  );
}
