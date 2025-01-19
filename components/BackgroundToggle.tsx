"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button } from "./ui";

const FloatingToggle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 5px;

  & button {
    font-size: 0.8rem;
  }
`;

const BackgroundToggle = () => {
  const [backgroundType, setBackgroundType] = useState<"white" | "gradient">(
    "gradient"
  );

  // Effect hook to change the background color of the HTML body
  useEffect(() => {
    if (backgroundType === "gradient") {
      document.body.style.background =
        "linear-gradient(to right, #62cc54, #bfe285)";
    } else {
      document.body.style.background = "white";
    }
  }, [backgroundType]); // This effect runs whenever `backgroundType` changes

  const toggleBackground = () => {
    setBackgroundType((prev) => (prev === "white" ? "gradient" : "white"));
  };

  return (
    <FloatingToggle>
      <Button
        isAsync={false}
        onClick={toggleBackground}
        text="Switch background colour"
      />
    </FloatingToggle>
  );
};

export default BackgroundToggle;
