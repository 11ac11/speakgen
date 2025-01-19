import React from "react";
import { MouseEventHandler } from "react";

export default function Secondarybtn({
  onClick,
  text = "Get Question",
}: {
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  text?: String;
}) {
  return (
    <button className="secondaryBtn" onClick={onClick}>
      {text}
    </button>
  );
}
